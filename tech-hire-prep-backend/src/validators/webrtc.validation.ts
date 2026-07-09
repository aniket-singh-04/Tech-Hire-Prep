import { z } from "zod";

export const webrtcTokenSchema = z.object({
  roomId: z.string().optional(),
}).strict();

export const webrtcSignalSchema = z.object({
  roomId: z.string().min(1),
  candidate: z.any().optional(),
  offer: z.any().optional(),
  answer: z.any().optional(),
}).strict();
