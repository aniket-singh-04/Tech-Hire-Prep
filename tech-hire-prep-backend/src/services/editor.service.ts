import { Types } from "mongoose";
import interviewSessionRepository from "../repositories/interviewSession.repository.ts";
import { AppError } from "../utils/appError.ts";
import { ensureSessionTimeActive } from "../utils/security.ts";
import { CODE_TEMPLATES, JUDGE0_LANGUAGES } from "../constants/judge0Languages.ts";
import { getJudge0Result, submitCodeToJudge0 } from "./judge0.service.ts";

/**
 * Returns all available language templates.
 */
export const getEditorTemplatesService = () => {
  const templates = Object.entries(CODE_TEMPLATES).map(([language, code]) => ({
    language,
    code,
  }));
  return { templates };
};

/**
 * Fetches editor state for a session.
 * Populates the match request (including description) for session room context.
 */
export const getEditorSessionService = async (sessionId: string, userId: string) => {
  const session = await interviewSessionRepository.findByIdWithPopulatedMatchId(sessionId);

  ensureSessionTimeActive(session);
  if (!session) throw new AppError("Session not found.", 404);

  if (
    session.interviewerId.toString() !== userId &&
    session.intervieweeId.toString() !== userId
  ) {
    throw new AppError("You are not a participant of this session.", 403);
  }

  return {
    sessionId: session._id,
    roomId: session.roomId,
    status: session.status,
    code: session.code ?? null,
    language: session.language ?? null,
    match: session.matchId,
  };
};

/**
 * Persists editor code + language into the session document.
 */
export const saveEditorSessionService = async (
  sessionId: string,
  userId: string,
  code: string,
  language: string
) => {
  const session = await interviewSessionRepository.findById(new Types.ObjectId(sessionId));
  if (!session) throw new AppError("Session not found.", 404);
  ensureSessionTimeActive(session);
  if (
    session.interviewerId.toString() !== userId &&
    session.intervieweeId.toString() !== userId
  ) {
    throw new AppError("You are not a participant of this session.", 403);
  }

  const updated = await interviewSessionRepository.updateCode(new Types.ObjectId(sessionId), { code, language });

  return {
    sessionId: updated!._id,
    code: updated!.code,
    language: updated!.language,
  };
};

/**
 * Code execution placeholder.
 * A real execution engine (e.g. Judge0) would be integrated here.
 */
export const runEditorSessionService = async (
  sessionId: string,
  userId: string,
  code: string,
  language: string,
  input?: string,
) => {

  if (!Types.ObjectId.isValid(sessionId)) {
    throw new AppError("Invalid session id.", 400,);
  }
  const session = await interviewSessionRepository.findById(new Types.ObjectId(sessionId));
  if (!session) {
    throw new AppError("Session not found.", 404,);
  }

  ensureSessionTimeActive(session);
  const isParticipant = session.interviewerId.toString() === userId || session.intervieweeId.toString() === userId;

  if (!isParticipant) {
    throw new AppError("You are not a participant of this session.", 403,);
  }

  if (!code || !language) {
    throw new AppError("Code and language are required.", 400,);
  }

  const languageId = JUDGE0_LANGUAGES[ language as keyof typeof JUDGE0_LANGUAGES ];

  if (!languageId) {
    throw new AppError( "Unsupported language", 400 );
  }

  // const submission = await submitCodeToJudge0({ code, languageId, input, });
  // const result = await getJudge0Result( submission.token );
  // return {
  //   token: submission.token,
  //   status: result.status,
  //   output: result.stdout,
  //   error: result.stderr,
  //   compileError: result.compile_output,
  // };


  throw new AppError("Code execution is not yet available.", 501,);
};

/**
 * Resets editor code + language to null (clean slate / back to template).
 */
export const resetEditorSessionService = async (sessionId: string, userId: string) => {
  const session = await interviewSessionRepository.findById(new Types.ObjectId(sessionId));
  if (!session) throw new AppError("Session not found.", 404);
  ensureSessionTimeActive(session);
  if (
    session.interviewerId.toString() !== userId &&
    session.intervieweeId.toString() !== userId
  ) {
    throw new AppError("You are not a participant of this session.", 403);
  }

  await interviewSessionRepository.clearCode(new Types.ObjectId(sessionId));

  return { reset: true };
};
