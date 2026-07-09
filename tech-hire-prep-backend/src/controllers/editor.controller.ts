import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler.ts";
import { ok } from "../common/response.ts";
import {
  getEditorTemplatesService,
  getEditorSessionService,
  saveEditorSessionService,
  runEditorSessionService,
  resetEditorSessionService,
} from "../services/editor.service.ts";

export const editorTemplatesController = asyncHandler(async (_req: Request, res: Response) => {
  const result = getEditorTemplatesService();
  return ok(res, result, "Editor templates fetched successfully.");
});

export const editorSessionController = asyncHandler(async (req: Request, res: Response) => {
  const result = await getEditorSessionService(req.params.sessionId as string, req.user!.id);
  return ok(res, result, "Editor session fetched successfully.");
});

export const editorSaveController = asyncHandler(async (req: Request, res: Response) => {
  const { code, language } = req.body;
  const result = await saveEditorSessionService(req.params.sessionId as string, req.user!.id, code, language);
  return ok(res, result, "Code saved successfully.");
});

export const editorRunController = asyncHandler(async (req: Request, res: Response) => {
  const { code, language, input } = req.body;
  const result = await runEditorSessionService(req.params.sessionId as string, req.user!.id, code, language, input);
  return ok(res, result, "Code executed successfully.");
});

export const editorResetController = asyncHandler(async (req: Request, res: Response) => {
  const result = await resetEditorSessionService(req.params.sessionId as string, req.user!.id);
  return ok(res, result, "Editor reset successfully.");
});
