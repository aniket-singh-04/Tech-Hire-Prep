import { z } from "zod";

const mongoIdSchema = z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid session ID format");

export const sessionIdParamsSchema = z.object({
  sessionId: mongoIdSchema,
}).strict();

export const editorSaveSchema = z.object({
  code: z.string(),
  language: z.string().min(1, "Language is required").trim(),
}).strict();

export const editorRunSchema = z.object({
  code: z.string(),
  language: z.string().min(1, "Language is required").trim(),
  input: z.string().optional(),
}).strict();

export const editorResetSchema = z.object({}).strict();
