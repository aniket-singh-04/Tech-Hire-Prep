import { z } from "zod";

const objectIdSchema = z.string().regex(/^[a-f\d]{24}$/i);

export const webrtcTokenSchema = z.object({
  sessionId: objectIdSchema,
});

export const webrtcSignalSchema = z.object({
  sessionId: objectIdSchema,
  type: z.enum(["offer", "answer", "ice-candidate"]),
  payload: z.record(z.string(), z.unknown()),
});
