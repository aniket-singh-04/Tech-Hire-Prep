import { z } from "zod";

export const editorSaveSchema = z.object({
  language: z.string().trim().min(2).max(40).optional(),
  code: z.string().min(1).max(20000),
});

export const editorRunSchema = z.object({
  language: z.string().trim().min(2).max(40),
  code: z.string().min(1).max(20000),
  input: z.string().max(2000).optional(),
});

export const editorResetSchema = z.object({
  templateId: z.string().trim().min(2).max(40).optional(),
});
