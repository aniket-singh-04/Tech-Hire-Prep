import mongoose from "mongoose";
import { InterviewRequest } from "../models/interview-request.model.js";
import { InterviewSession } from "../models/interview-session.model.js";
import { AppError } from "../utils/appError.js";
import { writeAuditLog } from "./audit.service.js";
import { emitSessionEvent } from "./realtime.service.js";

type SessionLike = InstanceType<typeof InterviewSession>;

const ensureParticipantSession = async (sessionId: string, userId: string) => {
  const session = await InterviewSession.findById(sessionId);
  if (!session) throw new AppError("Session not found.", 404);
  const participant = session.participants.find((item) => item.userId.toString() === userId);
  if (!participant) throw new AppError("Forbidden", 403);
  return { session, participant };
};

const mapSession = (session: SessionLike | null) => {
  if (!session) return null;
  return {
    id: session._id.toString(),
    requestIds: session.requestIds.map((item) => item.toString()),
    participants: session.participants.map((item) => ({ userId: item.userId.toString(), role: item.role, feedbackSubmitted: item.feedbackSubmitted, joinedAt: item.joinedAt, leftAt: item.leftAt })),
    status: session.status,
    scheduledAt: session.scheduledAt,
    startedAt: session.startedAt,
    endedAt: session.endedAt,
    roomId: session.roomId,
    editor: session.editor,
    scorecard: session.scorecard,
    reports: session.reports.map((item) => ({ userId: item.userId.toString(), reason: item.reason, createdAt: item.createdAt })),
    ratingSummary: session.ratingSummary,
  };
};

export const scheduleSession = async (userId: string, payload: { sessionId?: string; requestId?: string; scheduledAt: string }, auditContext?: { requestId?: string; ipAddress?: string }) => {
  let session = payload.sessionId ? await InterviewSession.findById(payload.sessionId) : null;
  if (!session && payload.requestId) {
    const request = await InterviewRequest.findById(payload.requestId).lean();
    if (!request?.sessionId) throw new AppError("Matched session not found for request.", 404);
    session = await InterviewSession.findById(request.sessionId);
  }
  if (!session) throw new AppError("Session not found.", 404);
  if (!session.participants.some((item) => item.userId.toString() === userId)) throw new AppError("Forbidden", 403);

  session.scheduledAt = new Date(payload.scheduledAt);
  session.status = "scheduled";
  await session.save();
  await writeAuditLog({ actorUserId: userId, action: "session.scheduled", targetType: "session", targetId: session._id.toString(), requestId: auditContext?.requestId, ipAddress: auditContext?.ipAddress });
  emitSessionEvent(session._id.toString(), "session:scheduled", { scheduledAt: session.scheduledAt });
  return mapSession(session);
};

export const getUpcomingSessions = async (userId: string) => {
  const sessions = await InterviewSession.find({ "participants.userId": new mongoose.Types.ObjectId(userId), status: { $in: ["matched", "scheduled", "live"] } }).sort({ scheduledAt: 1 });
  return sessions.map((session) => mapSession(session)).filter(Boolean);
};

export const getSessionHistory = async (userId: string) => {
  const sessions = await InterviewSession.find({ "participants.userId": new mongoose.Types.ObjectId(userId), status: { $in: ["completed", "cancelled"] } }).sort({ updatedAt: -1 });
  return sessions.map((session) => mapSession(session)).filter(Boolean);
};

export const getSessionById = async (sessionId: string, userId: string) => mapSession((await ensureParticipantSession(sessionId, userId)).session);

export const rescheduleSession = async (sessionId: string, userId: string, scheduledAt: string, auditContext?: { requestId?: string; ipAddress?: string }) => {
  const { session } = await ensureParticipantSession(sessionId, userId);
  session.scheduledAt = new Date(scheduledAt);
  session.status = "scheduled";
  await session.save();
  await writeAuditLog({ actorUserId: userId, action: "session.rescheduled", targetType: "session", targetId: sessionId, requestId: auditContext?.requestId, ipAddress: auditContext?.ipAddress });
  emitSessionEvent(sessionId, "session:rescheduled", { scheduledAt: session.scheduledAt });
  return mapSession(session);
};

export const cancelSession = async (sessionId: string, userId: string, auditContext?: { requestId?: string; ipAddress?: string }) => {
  const { session } = await ensureParticipantSession(sessionId, userId);
  session.status = "cancelled";
  await session.save();
  await writeAuditLog({ actorUserId: userId, action: "session.cancelled", targetType: "session", targetId: sessionId, requestId: auditContext?.requestId, ipAddress: auditContext?.ipAddress });
  emitSessionEvent(sessionId, "session:cancelled", { userId });
  return mapSession(session);
};

export const joinSession = async (sessionId: string, userId: string, auditContext?: { requestId?: string; ipAddress?: string }) => {
  const { session, participant } = await ensureParticipantSession(sessionId, userId);
  participant.joinedAt = new Date();
  await session.save();
  await writeAuditLog({ actorUserId: userId, action: "session.joined", targetType: "session", targetId: sessionId, requestId: auditContext?.requestId, ipAddress: auditContext?.ipAddress });
  emitSessionEvent(sessionId, "session:joined", { userId, roomId: session.roomId });
  return { session: mapSession(session), roomId: session.roomId, editor: session.editor };
};

export const leaveSession = async (sessionId: string, userId: string, auditContext?: { requestId?: string; ipAddress?: string }) => {
  const { session, participant } = await ensureParticipantSession(sessionId, userId);
  participant.leftAt = new Date();
  await session.save();
  await writeAuditLog({ actorUserId: userId, action: "session.left", targetType: "session", targetId: sessionId, requestId: auditContext?.requestId, ipAddress: auditContext?.ipAddress });
  emitSessionEvent(sessionId, "session:left", { userId });
  return { session: mapSession(session) };
};

export const startSession = async (sessionId: string, userId: string, auditContext?: { requestId?: string; ipAddress?: string }) => {
  const { session } = await ensureParticipantSession(sessionId, userId);
  session.status = "live";
  session.startedAt = new Date();
  await session.save();
  await writeAuditLog({ actorUserId: userId, action: "session.started", targetType: "session", targetId: sessionId, requestId: auditContext?.requestId, ipAddress: auditContext?.ipAddress });
  emitSessionEvent(sessionId, "session:started", { userId, startedAt: session.startedAt });
  return mapSession(session);
};

export const endSession = async (sessionId: string, userId: string, auditContext?: { requestId?: string; ipAddress?: string }) => {
  const { session } = await ensureParticipantSession(sessionId, userId);
  session.status = "completed";
  session.endedAt = new Date();
  await session.save();
  await writeAuditLog({ actorUserId: userId, action: "session.ended", targetType: "session", targetId: sessionId, requestId: auditContext?.requestId, ipAddress: auditContext?.ipAddress });
  emitSessionEvent(sessionId, "session:ended", { userId, endedAt: session.endedAt });
  return mapSession(session);
};

export const reconnectSession = async (sessionId: string, userId: string) => {
  const { session } = await ensureParticipantSession(sessionId, userId);
  return { session: mapSession(session), pendingSignals: session.webrtcSignals.slice(-20), editor: session.editor };
};

export const reportSession = async (sessionId: string, userId: string, reason: string, auditContext?: { requestId?: string; ipAddress?: string }) => {
  const { session } = await ensureParticipantSession(sessionId, userId);
  session.reports.push({ userId: new mongoose.Types.ObjectId(userId), reason, createdAt: new Date() });
  await session.save();
  await writeAuditLog({ actorUserId: userId, action: "session.reported", targetType: "session", targetId: sessionId, requestId: auditContext?.requestId, ipAddress: auditContext?.ipAddress, metadata: { reason } });
  return mapSession(session);
};

export const rateSession = async (sessionId: string, userId: string, rating: number, auditContext?: { requestId?: string; ipAddress?: string }) => {
  const { session } = await ensureParticipantSession(sessionId, userId);
  const nextCount = session.ratingSummary.count + 1;
  const nextAverage = ((session.ratingSummary.averageRating * session.ratingSummary.count) + rating) / nextCount;
  session.ratingSummary = { averageRating: Number(nextAverage.toFixed(2)), count: nextCount };
  await session.save();
  await writeAuditLog({ actorUserId: userId, action: "session.rated", targetType: "session", targetId: sessionId, requestId: auditContext?.requestId, ipAddress: auditContext?.ipAddress, metadata: { rating } });
  return session.ratingSummary;
};
