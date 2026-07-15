import { z } from "zod";

const sessionOrRoomObject = z.object({
  sessionId: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid session ID format").optional(),
  roomId: z.string().min(1).optional(),
}).strict();

export const webrtcTokenSchema = sessionOrRoomObject.refine((value) => Boolean(value.sessionId || value.roomId), {
  message: "Either sessionId or roomId is required",
  path: ["sessionId"],
});

export const webrtcSignalSchema = z.object({
  sessionId: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid session ID format").optional(),
  roomId: z.string().min(1),
  candidate: z.any().optional(),
  offer: z.any().optional(),
  answer: z.any().optional(),
}).strict();
