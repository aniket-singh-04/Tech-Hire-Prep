import InterviewSessionModel, { InterviewSessionStatus } from "../models/interviewSession.model.ts";
import { emitToUser } from "../socket/index.ts";
import { AppError } from "../utils/appError.ts";
import { Types } from "mongoose";
import { PaymentRepository } from "../repositories/payment.repository.ts";

const toIso = (value?: Date | string | null) => (value ? new Date(value).toISOString() : undefined);
const toId = (value: unknown): string => {
  if (value === null || value === undefined) return "";
  if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") return String(value);

  if ( value instanceof Types.ObjectId) {
    return value.toHexString();
  }

  if(typeof value === "object"){
    const record = value as Record<string, unknown> & { _id?: unknown; toString?: () => string};
    const maybeId = record._id;

    if (maybeId !== undefined && maybeId !== null && maybeId !== value){
      return toId(maybeId);
    }
    if (typeof record.toString === "function"){
      const rendered = record.toString();
      if (rendered && rendered !== "[boject Object]"){
        return rendered;
      }
    }
  }
    
  return "";
};

const mapSessionStatus = (status: InterviewSessionStatus) => {
  switch (status) {
    case InterviewSessionStatus.CREATED:
      return "matched";
    case InterviewSessionStatus.SCHEDULED:
    case InterviewSessionStatus.READY:
      return "scheduled";
    case InterviewSessionStatus.JOINED:
    case InterviewSessionStatus.ACTIVE:
      return "live";
    case InterviewSessionStatus.COMPLETED:
      return "completed";
    case InterviewSessionStatus.CANCELLED:
      return "cancelled";
    default:
      return "scheduled";
  }
};

const buildScorecard = (session: any) => {
  if (session.status !== InterviewSessionStatus.COMPLETED) {
    return undefined;
  }

  const ratingCount = session.ratingCount ?? session.ratings?.length ?? 0;
  const ratingTotal = session.ratingTotal ?? session.ratings?.reduce((sum: number, item: { value?: number }) => sum + (item.value ?? 0), 0) ?? 0;
  const average = ratingCount > 0 ? ratingTotal / ratingCount : (session.rating ?? 0);
  const normalized = ratingCount > 0 ? Math.max(1, Math.min(10, Math.round((average || 0) * 2))) : 0;
  const strong = normalized >= 8 ? ["Clear communication", "Strong ownership"] : normalized >= 6 ? ["Solid structure", "Good fundamentals"] : normalized > 0 ? ["Completed the session"] : [];
  const improvements = normalized <= 5 && normalized > 0 ? ["Improve pacing", "Add more detail"] : normalized <= 7 && normalized > 0 ? ["Tighten examples"] : [];

  return {
    overallScore: normalized,
    rubric: {
      communication: normalized,
      problemSolving: normalized,
      technicalDepth: normalized,
      clarity: normalized,
      collaboration: normalized,
      timeManagement: normalized,
    },
    strengths: strong,
    improvements,
    generatedAt: toIso(session.endTime ?? session.updatedAt) ?? new Date().toISOString(),
  };
};

const buildParticipants = (session: any) => {
  const feedbackUsers = new Set<string>((session.feedbackEntries ?? []).map((entry: any) => toId(entry.userId)));

  return [
    {
      userId: toId(session.intervieweeId),
      role: "candidate" as const,
      joinedAt: toIso(session.intervieweeJoinedAt),
      leftAt: toIso(session.intervieweeLeftAt),
      feedbackSubmitted: feedbackUsers.has(toId(session.intervieweeId)),
    },
    {
      userId: toId(session.interviewerId),
      role: "interviewer" as const,
      joinedAt: toIso(session.interviewerJoinedAt),
      leftAt: toIso(session.interviewerLeftAt),
      feedbackSubmitted: feedbackUsers.has(toId(session.interviewerId)),
    },
  ];
};

const toSessionResponse = (session: any) => {
  if (!session) return null;

  const matchId = session.matchId && typeof session.matchId === "object" && "_id" in session.matchId
    ? session.matchId._id
    : session.matchId;

  const ratings = session.ratings ?? [];
  const ratingCount = session.ratingCount ?? ratings.length;
  const ratingTotal = session.ratingTotal ?? ratings.reduce((sum: number, item: { value?: number }) => sum + (item.value ?? 0), 0);
  const averageRating = ratingCount > 0 ? Number((ratingTotal / ratingCount).toFixed(2)) : 0;

  return {
    id: toId(session._id ?? session.id),
    requestIds: [toId(matchId)].filter(Boolean),
    participants: buildParticipants(session),
    status: mapSessionStatus(session.status),
    scheduledAt: toIso(session.scheduledAt ?? session.startTime ?? session.createdAt),
    startedAt: toIso(session.startTime),
    endedAt: toIso(session.endTime),
    roomId: session.roomId,
    editor: {
      language: session.language ?? "javascript",
      code: session.code ?? "",
      version: 1,
      lastUpdatedBy: undefined,
      lastUpdatedAt: toIso(session.updatedAt),
    },
    scorecard: buildScorecard(session),
    reports: (session.reports ?? []).map((report: any) => ({
      userId: toId(report.userId),
      reason: report.reason,
      createdAt: toIso(report.createdAt) ?? new Date().toISOString(),
    })),
    ratingSummary: {
      averageRating,
      count: ratingCount,
    },
  };
};

const getOwnedSessionById = async (sessionId: string, userId: string) => {
  const session = await InterviewSessionModel.findById(sessionId).populate("matchId");

  if (!session) {
    throw new AppError("Session not found", 404);
  }

  if (session.interviewerId.toString() !== userId && session.intervieweeId.toString() !== userId) {
    throw new AppError("Unauthorized access to session", 403);
  }
  
  console.log("rr",session, "rr")
  return session;
};

const ensureParticipant = (session: any, userId: string) => {
  if (session.interviewerId.toString() !== userId && session.intervieweeId.toString() !== userId) {
    throw new AppError("Unauthorized access to session", 403);
  }
};

const ensureJoinable = (session: any) => {
  if ([InterviewSessionStatus.COMPLETED, InterviewSessionStatus.CANCELLED].includes(session.status)) {
    throw new AppError("This session can no longer be joined.", 400);
  }
};

export const getSessionService = async (sessionId: string, userId: string) => {
  const session = await getOwnedSessionById(sessionId, userId);
  return toSessionResponse(session);
};

export const getUpcomingSessionsService = async (userId: string) => {
  const sessions = await InterviewSessionModel.find({
    $or: [{ interviewerId: userId }, { intervieweeId: userId }],
    status: { $in: [InterviewSessionStatus.CREATED, InterviewSessionStatus.SCHEDULED, InterviewSessionStatus.READY, InterviewSessionStatus.JOINED, InterviewSessionStatus.ACTIVE] },
  }).sort({ scheduledAt: 1, createdAt: 1 });

  return sessions.map(toSessionResponse);
};

export const getHistorySessionsService = async (userId: string) => {
  const sessions = await InterviewSessionModel.find({
    $or: [{ interviewerId: userId }, { intervieweeId: userId }],
    status: { $in: [InterviewSessionStatus.COMPLETED, InterviewSessionStatus.CANCELLED] },
  }).sort({ createdAt: -1 });

  return sessions.map(toSessionResponse);
};

export const scheduleSessionService = async (userId: string, matchId: string, startTime: Date, endTime: Date) => {
  const session = await InterviewSessionModel.findOne({ matchId: new Types.ObjectId(matchId) });

  if (!session) {
    throw new AppError("Session not found for this match.", 404);
  }

  ensureParticipant(session, userId);
  ensureJoinable(session);

  session.scheduledAt = startTime;
  session.startTime = startTime;
  session.endTime = endTime;
  session.status = InterviewSessionStatus.SCHEDULED;
  await session.save();

  const otherUserId = session.interviewerId.toString() === userId ? session.intervieweeId : session.interviewerId;
  emitToUser(otherUserId.toString(), "session-scheduled", { sessionId: session._id.toString(), matchId, startTime, endTime });

  return toSessionResponse(session);
};

export const rescheduleSessionService = async (sessionId: string, userId: string, startTime: Date, endTime: Date) => {
  const session = await getOwnedSessionById(sessionId, userId);
  ensureJoinable(session);

  session.scheduledAt = startTime;
  session.startTime = startTime;
  session.endTime = endTime;
  session.status = InterviewSessionStatus.SCHEDULED;
  await session.save();

  const otherUserId = session.interviewerId.toString() === userId ? session.intervieweeId : session.interviewerId;
  emitToUser(otherUserId.toString(), "session-rescheduled", { sessionId, startTime, endTime });

  return toSessionResponse(session);
};

export const joinSessionService = async (sessionId: string, userId: string) => {
  const session = await getOwnedSessionById(sessionId, userId);
  ensureJoinable(session);

  const isInterviewer = session.interviewerId.toString() === userId;
  const isInterviewee = session.intervieweeId.toString() === userId;

  if (isInterviewee) {
    const confirmedPayment = await PaymentRepository.findPaidByUserAndSession(userId, sessionId);

    if (!confirmedPayment) {
      throw new AppError(
        "Payment required to join this session. Please complete the payment and try again.",
        402
      );
    }
  }

  const now = new Date();
  if (isInterviewer) {
    session.interviewerJoinedAt = now;
  } else if (isInterviewee) {
    session.intervieweeJoinedAt = now;
  }

  const bothJoined = Boolean(session.interviewerJoinedAt && session.intervieweeJoinedAt);
  session.readyAt = bothJoined ? session.readyAt ?? now : session.readyAt ?? now;
  session.status = bothJoined ? InterviewSessionStatus.JOINED : InterviewSessionStatus.READY;
  await session.save();

  const otherUserId = isInterviewer ? session.intervieweeId : session.interviewerId;
  emitToUser(otherUserId.toString(), "peer-joined", { sessionId, userId, status: session.status });

  return toSessionResponse(session);
};

export const leaveSessionService = async (sessionId: string, userId: string) => {
  const session = await getOwnedSessionById(sessionId, userId);

  const otherUserId = session.interviewerId.toString() === userId ? session.intervieweeId : session.interviewerId;
  if (session.interviewerId.toString() === userId) {
    session.interviewerLeftAt = new Date();
  } else {
    session.intervieweeLeftAt = new Date();
  }
  await session.save();

  emitToUser(otherUserId.toString(), "peer-left", { sessionId });

  return toSessionResponse(session);
};

export const startSessionService = async (sessionId: string, userId: string) => {
  const session = await getOwnedSessionById(sessionId, userId);

  if (!session.interviewerJoinedAt || !session.intervieweeJoinedAt) {
    throw new AppError("Both participants must join before the session can start.", 400);
  }

  session.status = InterviewSessionStatus.ACTIVE;
  session.startTime = session.startTime ?? new Date();
  await session.save();

  const otherUserId = session.interviewerId.toString() === userId ? session.intervieweeId : session.interviewerId;
  emitToUser(otherUserId.toString(), "session-started", { sessionId });

  return toSessionResponse(session);
};

export const endSessionService = async (sessionId: string, userId: string) => {
  const session = await getOwnedSessionById(sessionId, userId);

  if (session.status !== InterviewSessionStatus.ACTIVE && session.status !== InterviewSessionStatus.JOINED) {
    throw new AppError("Cannot end session before it has started.", 400);
  }

  session.status = InterviewSessionStatus.COMPLETED;
  session.endTime = new Date();
  await session.save();

  const otherUserId = session.interviewerId.toString() === userId ? session.intervieweeId : session.interviewerId;
  emitToUser(otherUserId.toString(), "session-ended", { sessionId });

  return toSessionResponse(session);
};

export const cancelSessionService = async (sessionId: string, userId: string) => {
  const session = await getOwnedSessionById(sessionId, userId);

  if ([InterviewSessionStatus.COMPLETED, InterviewSessionStatus.CANCELLED].includes(session.status)) {
    throw new AppError("Session already closed.", 400);
  }

  session.status = InterviewSessionStatus.CANCELLED;
  session.endTime = session.endTime ?? new Date();
  await session.save();

  const otherUserId = session.interviewerId.toString() === userId ? session.intervieweeId : session.interviewerId;
  emitToUser(otherUserId.toString(), "session-cancelled", { sessionId });

  return toSessionResponse(session);
};

export const reconnectSessionService = async (sessionId: string, userId: string) => {
  const session = await getOwnedSessionById(sessionId, userId);
  ensureJoinable(session);

  const isInterviewer = session.interviewerId.toString() === userId;
  const isInterviewee = session.intervieweeId.toString() === userId;

  if (isInterviewer && !session.interviewerJoinedAt) {
    session.interviewerJoinedAt = new Date();
  }
  if (isInterviewee && !session.intervieweeJoinedAt) {
    session.intervieweeJoinedAt = new Date();
  }

  if (session.interviewerJoinedAt && session.intervieweeJoinedAt) {
    session.status = InterviewSessionStatus.JOINED;
  } else {
    session.status = InterviewSessionStatus.READY;
  }

  await session.save();

  const otherUserId = session.interviewerId.toString() === userId ? session.intervieweeId : session.interviewerId;
  emitToUser(otherUserId.toString(), "peer-reconnected", { sessionId, userId });

  return toSessionResponse(session);
};

export const reportSessionService = async (sessionId: string, userId: string, reason: string) => {
  const session = await getOwnedSessionById(sessionId, userId);
  session.reports = session.reports ?? [];
  session.reports.push({
    userId: new Types.ObjectId(userId),
    reason,
    createdAt: new Date(),
  });
  await session.save();
  return toSessionResponse(session);
};

export const rateSessionService = async (sessionId: string, userId: string, rating: number) => {
  const session = await getOwnedSessionById(sessionId, userId);
  session.ratings = session.ratings ?? [];

  const existingIndex = session.ratings.findIndex((entry: any) => entry.userId.toString() === userId);
  if (existingIndex >= 0) {
    const currentRating = session.ratings[existingIndex];
    session.ratingTotal = (session.ratingTotal ?? 0) - (currentRating?.value ?? 0) + rating;
    if (currentRating) {
      currentRating.value = rating;
      currentRating.createdAt = new Date();
    }
  } else {
    session.ratings.push({
      userId: new Types.ObjectId(userId),
      value: rating,
      createdAt: new Date(),
    });
    session.ratingCount = (session.ratingCount ?? 0) + 1;
    session.ratingTotal = (session.ratingTotal ?? 0) + rating;
  }

  session.rating = rating;
  session.ratingCount = session.ratings.length;
  session.ratingTotal = session.ratings.reduce((sum: number, entry: any) => sum + (entry.value ?? 0), 0);
  await session.save();

  return toSessionResponse(session);
};

export const feedbackSessionService = async (sessionId: string, userId: string, feedback: string) => {
  const session = await getOwnedSessionById(sessionId, userId);
  session.feedbackEntries = session.feedbackEntries ?? [];

  const existingIndex = session.feedbackEntries.findIndex((entry: any) => entry.userId.toString() === userId);
  if (existingIndex >= 0) {
    const currentFeedback = session.feedbackEntries[existingIndex];
    if (currentFeedback) {
      currentFeedback.feedback = feedback;
      currentFeedback.createdAt = new Date();
    }
  } else {
    session.feedbackEntries.push({
      userId: new Types.ObjectId(userId),
      feedback,
      createdAt: new Date(),
    });
  }

  session.feedback = feedback;
  await session.save();

  return toSessionResponse(session);
};
