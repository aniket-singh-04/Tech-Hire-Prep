import { z } from "zod";

export const sessionIdParamsSchema = z.object({
  sessionId: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid session ID format"),
}).strict();

export const scheduleSessionSchema = z.object({
  sessionId: z.string().regex(/^[0-9a-fA-F]{24}$/),
  startTime: z.coerce.date(),
  endTime: z.coerce.date(),
}).strict();

export const rescheduleSessionSchema = z.object({
  startTime: z.coerce.date(),
  endTime: z.coerce.date(),
}).strict();

export const reportSessionSchema = z.object({
  reason: z.string().min(10),
}).strict();

export const rateSessionSchema = z.object({
  rating: z.number().int().min(1).max(5),
}).strict();

export const feedbackSchema = z.object({
  feedback: z.string().min(10),
}).strict();
