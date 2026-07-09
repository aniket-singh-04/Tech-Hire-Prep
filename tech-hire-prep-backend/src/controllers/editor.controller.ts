import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler.ts";
import { ok } from "../common/response.ts";

export const editorTemplatesController = asyncHandler(async (req: Request, res: Response) => {
  return ok(res, { templates: [] }, "Editor templates fetched successfully");
});

export const editorSessionController = asyncHandler(async (req: Request, res: Response) => {
  return ok(res, { session: null }, "Editor session fetched successfully");
});

export const editorSaveController = asyncHandler(async (req: Request, res: Response) => {
  return ok(res, { saved: true }, "Editor saved successfully");
});

export const editorRunController = asyncHandler(async (req: Request, res: Response) => {
  return ok(res, { output: "Code executed successfully" }, "Editor run successfully");
});

export const editorResetController = asyncHandler(async (req: Request, res: Response) => {
  return ok(res, { reset: true }, "Editor reset successfully");
});
