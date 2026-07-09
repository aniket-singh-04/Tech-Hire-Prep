import { z } from "zod";

export const sessionIdParamsSchema = z.object({
  sessionId: z.string().min(1),
}).strict();

export const editorSaveSchema = z.object({
  code: z.string(),
  language: z.string(),
}).strict();

export const editorRunSchema = z.object({
  code: z.string(),
  language: z.string(),
  input: z.string().optional(),
}).strict();

export const editorResetSchema = z.object({}).strict();
