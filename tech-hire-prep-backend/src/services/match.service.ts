import { randomUUID } from "crypto";
import mongoose from "mongoose";
import { ENV } from "../config/envConfig.js";
import { InterviewRequest } from "../models/interview-request.model.js";
import { InterviewSession } from "../models/interview-session.model.js";
import { AppError } from "../utils/appError.js";
import { writeAuditLog } from "./audit.service.js";
import { emitMatchStatus } from "./realtime.service.js";
import { getOrCreateProfile } from "./profile.service.js";

const hasOverlap = (a: string[], b: string[]) => a.some((value) => b.includes(value));

const nextSlots = (availability: Array<{ day: string; start: string; end: string; timezone: string }>) => {
  if (availability.length > 0) {
    return availability.slice(0, 5).map((slot, index) => ({
      ...slot,
      startsAt: new Date(Date.now() + (index + 1) * 60 * 60 * 1000).toISOString(),
    }));
  }

  return Array.from({ length: 5 }).map((_, index) => ({
    day: "flexible",
    start: "18:00",
    end: "19:00",
    timezone: "Asia/Kolkata",
    startsAt: new Date(Date.now() + (index + 1) * 60 * 60 * 1000).toISOString(),
  }));
};

export const createMatchRequest = async (userId: string, payload: Record<string, unknown>, auditContext?: { requestId?: string; ipAddress?: string }) => {
  const profile = await getOrCreateProfile(userId);
  if (!profile.onboardingCompleted && profile.completionScore < 70) {
    throw new AppError("Complete onboarding before requesting a match.", 400);
  }

  const targetRole = typeof payload.targetRole === "string" ? payload.targetRole : profile.targetRole;
  if (!targetRole) throw new AppError("Target role is required.", 400);

  const skillTags = Array.isArray(payload.skillTags) ? payload.skillTags as string[] : profile.skillTags;
  const experienceLevel = typeof payload.experienceLevel === "number" ? payload.experienceLevel : profile.experienceLevel;
  const availability = Array.isArray(payload.availability) ? payload.availability as typeof profile.availability : profile.availability;
  const notes = typeof payload.notes === "string" ? payload.notes : undefined;

  const activeRequest = await InterviewRequest.findOne({ requesterId: new mongoose.Types.ObjectId(userId), status: { $in: ["pending", "matched"] }, expiresAt: { $gt: new Date() } });
  if (activeRequest) throw new AppError("You already have an active matchmaking request.", 409);

  const request = await InterviewRequest.create({
    requesterId: new mongoose.Types.ObjectId(userId),
    status: "pending",
    targetRole,
    skillTags,
    experienceLevel,
    availability,
    notes,
    expiresAt: new Date(Date.now() + ENV.MATCH_REQUEST_TTL_MINUTES * 60 * 1000),
  });

  const candidate = await InterviewRequest.findOne({
    _id: { $ne: request._id },
    status: "pending",
    expiresAt: { $gt: new Date() },
    requesterId: { $ne: new mongoose.Types.ObjectId(userId) },
  }).sort({ createdAt: 1 });

  let matchedSessionId: string | undefined;
  if (candidate && (candidate.targetRole === targetRole || hasOverlap(candidate.skillTags, skillTags))) {
    const session = await InterviewSession.create({
      requestIds: [request._id, candidate._id],
      participants: [
        { userId: request.requesterId, role: "candidate", feedbackSubmitted: false },
        { userId: candidate.requesterId, role: "interviewer", feedbackSubmitted: false },
      ],
      status: "matched",
      roomId: randomUUID(),
      editor: { language: "javascript", code: "function solve() {\n  return true;\n}", version: 1 },
      webrtcSignals: [],
      reports: [],
      ratingSummary: { averageRating: 0, count: 0 },
    });

    matchedSessionId = session._id.toString();
    await InterviewRequest.updateMany(
      { _id: { $in: [request._id, candidate._id] } },
      {
        $set: {
          status: "matched",
          matchedAt: new Date(),
          sessionId: session._id,
          matchedUserId: request.requesterId.equals(candidate.requesterId) ? undefined : request.requesterId,
        },
      },
    );

    emitMatchStatus(userId, { status: "matched", sessionId: matchedSessionId });
    emitMatchStatus(candidate.requesterId.toString(), { status: "matched", sessionId: matchedSessionId });
  } else {
    emitMatchStatus(userId, { status: "queued", requestId: request._id.toString() });
  }

  await writeAuditLog({ actorUserId: userId, action: "match.request_created", targetType: "interview_request", targetId: request._id.toString(), requestId: auditContext?.requestId, ipAddress: auditContext?.ipAddress });

  return {
    requestId: request._id.toString(),
    status: matchedSessionId ? "matched" : "pending",
    sessionId: matchedSessionId,
  };
};

export const getQueueStatus = async (userId: string) => {
  const request = await InterviewRequest.findOne({ requesterId: new mongoose.Types.ObjectId(userId), status: { $in: ["pending", "matched"] } }).sort({ createdAt: -1 }).lean();
  if (!request) {
    return { status: "idle" };
  }

  return {
    status: request.status,
    requestId: request._id.toString(),
    sessionId: request.sessionId?.toString(),
    expiresAt: request.expiresAt,
  };
};

export const cancelMatchRequest = async (userId: string, auditContext?: { requestId?: string; ipAddress?: string }) => {
  const request = await InterviewRequest.findOneAndUpdate(
    { requesterId: new mongoose.Types.ObjectId(userId), status: "pending" },
    { $set: { status: "cancelled" } },
    { new: true },
  );
  if (!request) throw new AppError("No active pending request found.", 404);
  await writeAuditLog({ actorUserId: userId, action: "match.request_cancelled", targetType: "interview_request", targetId: request._id.toString(), requestId: auditContext?.requestId, ipAddress: auditContext?.ipAddress });
  emitMatchStatus(userId, { status: "cancelled" });
  return { status: "cancelled" };
};

export const getAvailableSlots = async (userId: string) => {
  const profile = await getOrCreateProfile(userId);
  return { slots: nextSlots(profile.availability) };
};
