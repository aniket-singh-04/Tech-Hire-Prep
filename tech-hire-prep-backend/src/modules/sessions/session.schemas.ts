import { z } from "zod";

const objectIdSchema = z.string().regex(/^[a-f\d]{24}$/i);

export const sessionIdParamsSchema = z.object({
  sessionId: objectIdSchema,
});

export const scheduleSessionSchema = z.object({
  sessionId: objectIdSchema.optional(),
  requestId: objectIdSchema.optional(),
  scheduledAt: z.iso.datetime(),
});

export const rescheduleSessionSchema = z.object({
  scheduledAt: z.iso.datetime(),
});

export const reportSessionSchema = z.object({
  reason: z.string().trim().min(5).max(300),
});

export const rateSessionSchema = z.object({
  rating: z.number().int().min(1).max(5),
});

export const feedbackSchema = z.object({
  toUserId: objectIdSchema.optional(),
  rating: z.number().int().min(1).max(5),
  rubric: z.object({
    communication: z.number().min(1).max(5),
    problemSolving: z.number().min(1).max(5),
    technicalDepth: z.number().min(1).max(5),
    clarity: z.number().min(1).max(5),
    collaboration: z.number().min(1).max(5),
    timeManagement: z.number().min(1).max(5),
  }),
  strengths: z.array(z.string().trim().min(1).max(120)).max(5).default([]),
  improvements: z.array(z.string().trim().min(1).max(120)).max(5).default([]),
  summary: z.string().trim().max(500).optional(),
  recommendation: z.enum(["strong_hire", "hire", "mixed", "no_hire"]).optional(),
});
