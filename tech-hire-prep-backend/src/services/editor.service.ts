import { InterviewSession } from "../models/interview-session.model.js";
import { AppError } from "../utils/appError.js";
import { emitSessionEvent } from "./realtime.service.js";

const templates = [
  {
    id: "two-sum",
    title: "Two Sum",
    language: "javascript",
    code: "function solve(nums, target) {\n  const seen = new Map();\n  for (let i = 0; i < nums.length; i += 1) {\n    const diff = target - nums[i];\n    if (seen.has(diff)) return [seen.get(diff), i];\n    seen.set(nums[i], i);\n  }\n  return [];\n}",
  },
  {
    id: "reverse-list",
    title: "Reverse Linked List",
    language: "javascript",
    code: "function solve(head) {\n  let prev = null;\n  let current = head;\n  while (current) {\n    const next = current.next;\n    current.next = prev;\n    prev = current;\n    current = next;\n  }\n  return prev;\n}",
  },
] as const;

const requireSessionParticipant = async (sessionId: string, userId: string) => {
  const session = await InterviewSession.findById(sessionId);
  if (!session) throw new AppError("Session not found.", 404);
  if (!session.participants.some((item) => item.userId.toString() === userId)) throw new AppError("Forbidden", 403);
  return session;
};

export const getEditorTemplates = async () => ({ templates });

export const getSessionEditor = async (sessionId: string, userId: string) => {
  const session = await requireSessionParticipant(sessionId, userId);
  return { sessionId, editor: session.editor };
};

export const saveSessionEditor = async (sessionId: string, userId: string, payload: { language?: string; code: string }) => {
  const session = await requireSessionParticipant(sessionId, userId);
  session.editor = {
    language: payload.language ?? session.editor.language,
    code: payload.code,
    version: session.editor.version + 1,
    lastUpdatedBy: session.participants.find((item) => item.userId.toString() === userId)?.userId,
    lastUpdatedAt: new Date(),
  };
  await session.save();
  emitSessionEvent(sessionId, "editor:saved", { editor: session.editor, userId });
  return { editor: session.editor };
};

export const runSessionCode = async (sessionId: string, userId: string, payload: { language: string; code: string; input?: string }) => {
  await requireSessionParticipant(sessionId, userId);
  return {
    language: payload.language,
    stdout: "Execution sandbox is mocked in MVP mode.",
    stderr: "",
    exitCode: 0,
    inputEcho: payload.input ?? "",
    summary: payload.code.includes("return") ? "Code looks runnable." : "Add a return path before shipping.",
  };
};

export const resetSessionEditor = async (sessionId: string, userId: string, templateId?: string) => {
  const session = await requireSessionParticipant(sessionId, userId);
  const template = templates.find((item) => item.id === templateId) ?? templates[0];
  session.editor = {
    language: template.language,
    code: template.code,
    version: session.editor.version + 1,
    lastUpdatedBy: session.participants.find((item) => item.userId.toString() === userId)?.userId,
    lastUpdatedAt: new Date(),
  };
  await session.save();
  emitSessionEvent(sessionId, "editor:reset", { editor: session.editor, userId, templateId: template.id });
  return { editor: session.editor, template };
};
