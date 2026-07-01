import mongoose from "mongoose";
import { InterviewSession } from "../models/interview-session.model.js";
import { AppError } from "../utils/appError.js";
import { emitSessionEvent } from "./realtime.service.js";

const requireSessionParticipant = async (sessionId: string, userId: string) => {
  const session = await InterviewSession.findById(sessionId);
  if (!session) throw new AppError("Session not found.", 404);
  if (!session.participants.some((item) => item.userId.toString() === userId)) throw new AppError("Forbidden", 403);
  return session;
};

export const createWebrtcToken = async (sessionId: string, userId: string) => {
  const session = await requireSessionParticipant(sessionId, userId);
  return {
    sessionId,
    roomId: session.roomId,
    userId,
    token: `rtc-${sessionId}-${userId}-${Date.now()}`,
    expiresAt: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
  };
};

export const createWebrtcRoom = async (sessionId: string, userId: string) => {
  const session = await requireSessionParticipant(sessionId, userId);
  return {
    sessionId,
    roomId: session.roomId,
    participants: session.participants.map((item) => ({ userId: item.userId.toString(), role: item.role })),
  };
};

export const submitWebrtcSignal = async (sessionId: string, userId: string, payload: { type: "offer" | "answer" | "ice-candidate"; payload: Record<string, unknown> }) => {
  const session = await requireSessionParticipant(sessionId, userId);
  session.webrtcSignals.push({
    fromUserId: new mongoose.Types.ObjectId(userId),
    type: payload.type,
    payload: payload.payload,
    createdAt: new Date(),
  });
  session.webrtcSignals = session.webrtcSignals.slice(-50);
  await session.save();
  emitSessionEvent(sessionId, "webrtc:signal", { fromUserId: userId, type: payload.type, payload: payload.payload });
  return { accepted: true };
};
