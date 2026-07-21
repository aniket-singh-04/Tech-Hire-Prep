import { InterviewSessionStatus } from "../models/interviewSession.model.ts";
import { emitToUser } from "../socket/index.ts";
import { AppError } from "../utils/appError.ts";
import { Types } from "mongoose";
import { PaymentRepository } from "../repositories/payment.repository.ts";
import interviewSessionRepository from "../repositories/interviewSession.repository.ts";
import { ensureJoinable, ensureSessionTimeActive } from "../utils/security.ts";

const toIso = (value?: Date | string | null) => (value ? new Date(value).toISOString() : undefined);
const toId = (value: unknown): string => {
  if (value === null || value === undefined) return "";
  if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") return String(value);

  if (value instanceof Types.ObjectId) {
    return value.toHexString();
  }

  if (typeof value === "object") {
    const record = value as Record<string, unknown> & { _id?: unknown; toString?: () => string };
    const maybeId = record._id;

    if (maybeId !== undefined && maybeId !== null && maybeId !== value) {
      return toId(maybeId);
    }
    if (typeof record.toString === "function") {
      const rendered = record.toString();
      if (rendered && rendered !== "[boject Object]") {
        return rendered;
      }
    }
  }

  return "";
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
  console.log(session)

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
    status: session.status,
    scheduledAt: toIso(session.scheduledAt ?? session.startTime),
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
  const session = await interviewSessionRepository.findByIdWithPopulatedMatchId(sessionId);

  if (!session) {
    throw new AppError("Session not found", 404);
  }

  if (session.interviewerId.toString() !== userId && session.intervieweeId.toString() !== userId) {
    throw new AppError("Unauthorized access to session", 403);
  }

  return session;
};

const ensureInterviewerId = (session: any, userId: string) => {
  if (session.interviewerId.toString() !== userId) {
    throw new AppError("Unauthorized access to session", 403);
  }
};


export const getSessionService = async (sessionId: string, userId: string) => {
  const session = await getOwnedSessionById(sessionId, userId);
  return toSessionResponse(session);
};

export const getUpcomingSessionsService = async (userId: string) => {
  const sessions = await interviewSessionRepository.findUserSessions(new Types.ObjectId(userId));
  console.log(userId)
  return sessions.map(toSessionResponse);
};

export const getHistorySessionsService = async (userId: string) => {
  const sessions = await interviewSessionRepository.findSessionHistory(new Types.ObjectId(userId));

  return sessions.map(toSessionResponse);
};

export const scheduleSessionService = async (userId: string, sessionId: string, startTime: Date, endTime: Date) => {
  if(startTime > endTime){
    throw new AppError("Invalid time (endtime is greater).", 404)
  }
  const session = await interviewSessionRepository.findById(new Types.ObjectId(sessionId));

  if (!session) {
    throw new AppError("Session not found for this match.", 404);
  }

  ensureInterviewerId(session, userId);
  ensureJoinable(session);

  await interviewSessionRepository.updateScedule(session._id, new Date(startTime), new Date(endTime), InterviewSessionStatus.SCHEDULED)

  emitToUser(session.intervieweeId.toString(), "session-scheduled", { sessionId, startTime, endTime });

  return toSessionResponse(session);
};

export const rescheduleSessionService = async (sessionId: string, userId: string, startTime: Date, endTime: Date) => {
  if(startTime > endTime){
    throw new AppError("Invalid time (endtime is greater).", 404)
  }
  const session = await getOwnedSessionById(sessionId, userId);
  ensureJoinable(session);
  ensureInterviewerId(session, userId);
    const confirmedPayment = await PaymentRepository.findPaidByUserAndSession(session.intervieweeId.toString(), sessionId);

  if (confirmedPayment) {
    throw new AppError("Candidate has completed the payment so reschedule is not possible.", 402);
  }
  
  await interviewSessionRepository.updateScedule(session._id, new Date(startTime), new Date(endTime), InterviewSessionStatus.SCHEDULED)

  emitToUser(session.intervieweeId.toString(), "session-rescheduled", { sessionId, startTime, endTime });

  return toSessionResponse(session);
};

export const joinSessionService = async (sessionId: string, userId: string) => {
  const session = await getOwnedSessionById(sessionId, userId);
  ensureJoinable(session);

  const isInterviewer = session.interviewerId.toString() === userId;
  const isInterviewee = session.intervieweeId.toString() === userId;

  if (!isInterviewer && !isInterviewee) {
    throw new AppError("You are not a participant in this session.", 403);
  }

  // Candidate payment is required before anyone can join
  const confirmedPayment = await PaymentRepository.findPaidByUserAndSession(session.intervieweeId.toString(), sessionId);

  if (!confirmedPayment) {
    if (isInterviewee) {
      throw new AppError("Payment required to join this session. Please complete the payment first.", 402);
    }
    throw new AppError("Candidate has not completed the payment yet.", 402);
  }

  ensureSessionTimeActive(session);
  const now = new Date();

  const updateData: any = {};

  if (isInterviewer && !session.interviewerJoinedAt) {
    updateData.interviewerJoinedAt = now;
  }

  if (isInterviewee && !session.intervieweeJoinedAt) {
    updateData.intervieweeJoinedAt = now;
  }

  const interviewerJoined = session.interviewerJoinedAt || updateData.interviewerJoinedAt;
  const intervieweeJoined = session.intervieweeJoinedAt || updateData.intervieweeJoinedAt;

  const bothJoined = Boolean(interviewerJoined && intervieweeJoined);

  updateData.status = bothJoined ? InterviewSessionStatus.JOINED : InterviewSessionStatus.READY;

  if (bothJoined && !session.readyAt) {
    updateData.readyAt = now;
  }

  const updatedSession = await interviewSessionRepository.updateSessionStatus(new Types.ObjectId(sessionId), updateData);

  const otherUserId = isInterviewer ? session.intervieweeId : session.interviewerId;
  emitToUser(otherUserId.toString(), "peer-joined", { sessionId, userId, status: updatedSession?.status, });
  return toSessionResponse(updatedSession);
};

export const leaveSessionService = async (sessionId: string, userId: string) => {
  const session = await getOwnedSessionById(sessionId, userId);

  const now = new Date();

  const isInterviewer = session.interviewerId.toString() === userId;

  const isInterviewee = session.intervieweeId.toString() === userId;

  if (!isInterviewer && !isInterviewee) {
    throw new AppError("You are not part of this session.", 403);
  }

  const otherUserId = isInterviewer ? session.intervieweeId : session.interviewerId;
  const updateData: any = {};
  if (isInterviewer && !session.interviewerLeftAt) {
    updateData.interviewerLeftAt = now;
    updateData.status = InterviewSessionStatus.READY
  }

  if (isInterviewee && !session.intervieweeLeftAt) {
    updateData.status = InterviewSessionStatus.READY
    updateData.intervieweeLeftAt = now;
  }

  const interviewerLeft = session.interviewerLeftAt || updateData.interviewerLeftAt;
  const intervieweeLeft = session.intervieweeLeftAt || updateData.intervieweeLeftAt;

  const bothLeft = Boolean(interviewerLeft && intervieweeLeft);

  if (bothLeft) {
    updateData.status = InterviewSessionStatus.COMPLETED;
    updateData.endTime = now;
  }

  const updatedSession = await interviewSessionRepository.updateSessionStatus(new Types.ObjectId(sessionId), updateData);

  emitToUser(otherUserId.toString(), "peer-left", { sessionId, status: updatedSession?.status, });
  return toSessionResponse(updatedSession);
};

export const cancelSessionService = async (sessionId: string, userId: string) => {
  const session = await getOwnedSessionById(sessionId, userId);

  if ([InterviewSessionStatus.COMPLETED, InterviewSessionStatus.CANCELLED].includes(session.status)) {
    throw new AppError("Session already closed.", 400);
  }

  await interviewSessionRepository.cancelSession(new Types.ObjectId(sessionId));

  const otherUserId = session.interviewerId.toString() === userId ? session.intervieweeId : session.interviewerId;
  emitToUser(otherUserId.toString(), "session-cancelled", { sessionId });

  return toSessionResponse(session);
};

export const reconnectSessionService = async (sessionId: string, userId: string) => {
  const session = await getOwnedSessionById(sessionId, userId);
  ensureJoinable(session);

  const isInterviewer = session.interviewerId.toString() === userId;
  const isInterviewee = session.intervieweeId.toString() === userId;

  if (!isInterviewer && !isInterviewee) {
    throw new AppError("You are not part of this session.", 403);
  }

  const updateData: any = {};

  if (isInterviewer) {
    if (!session.interviewerJoinedAt) {
      updateData.interviewerJoinedAt = new Date();
    }

    updateData.interviewerLeftAt = undefined;
  }

  if (isInterviewee) {
    if (!session.intervieweeJoinedAt) {
      updateData.intervieweeJoinedAt = new Date();
    }

    updateData.intervieweeLeftAt = undefined;
  }

  const interviewerPresent = !session.interviewerLeftAt || updateData.interviewerLeftAt === undefined;
  const intervieweePresent = !session.intervieweeLeftAt || updateData.intervieweeLeftAt === undefined;

  const bothPresent = interviewerPresent && intervieweePresent;

  if (bothPresent) {
    updateData.status = InterviewSessionStatus.ACTIVE;
  }

  const updatedSession =
    await interviewSessionRepository.updateSessionStatus(
      new Types.ObjectId(sessionId),
      updateData
    );

  const otherUserId = isInterviewer ? session.intervieweeId : session.interviewerId;

  emitToUser(otherUserId.toString(), "peer-reconnected", { sessionId, userId, status: updatedSession?.status, });

  return toSessionResponse(updatedSession);
};

export const reportSessionService = async (sessionId: string, userId: string, reason: string) => {
  const session = await getOwnedSessionById(sessionId, userId);

  const isParticipant = session.interviewerId.toString() === userId || session.intervieweeId.toString() === userId;
  if (session.status !== InterviewSessionStatus.COMPLETED) {
    throw new AppError("This session is not completed after completion you can report.", 400);
  }

  if (!isParticipant) {
    throw new AppError("You are not part of this session.", 403);
  }

  const updatedSession = await interviewSessionRepository.addReport(new Types.ObjectId(sessionId), {
    userId: new Types.ObjectId(userId),
    reason,
    createdAt: new Date(),
  }
  );

  return toSessionResponse(updatedSession);
};

export const rateSessionService = async (sessionId: string, userId: string, rating: number) => {
  const session = await getOwnedSessionById(sessionId, userId);

  if (session.status !== InterviewSessionStatus.COMPLETED) {
    throw new AppError("You can rate a session only after it has been completed.", 400);
  }

  if (rating < 1 || rating > 5) {
    throw new AppError("Rating must be between 1 and 5.", 400);
  }

  const isInterviewer = session.interviewerId.toString() === userId;
  const isInterviewee = session.intervieweeId.toString() === userId;

  if (!isInterviewer && !isInterviewee) {
    throw new AppError("You are not part of this session.", 403);
  }

  const toUserId = isInterviewer ? session.intervieweeId : session.interviewerId;
  const ratings = [...(session.ratings ?? [])];
  const existingIndex = ratings.findIndex(
    (entry) => entry.fromUserId.toString() === userId && entry.toUserId.toString() === toUserId.toString()
  );

  if (existingIndex >= 0) {
    const existing = ratings[existingIndex]!;
    existing.value = rating;
    existing.createdAt = new Date();
  } else {
    ratings.push({
      fromUserId: new Types.ObjectId(userId),
      toUserId: new Types.ObjectId(toUserId),
      value: rating,
      createdAt: new Date(),
    });
  }

  const updatedSession =
    await interviewSessionRepository.updateRatings(
      new Types.ObjectId(sessionId),
      {
        ratings,
      }
    );

  return toSessionResponse(updatedSession);
};

export const feedbackSessionService = async (sessionId: string, userId: string, feedback: string) => {
  const session = await getOwnedSessionById(sessionId, userId);

  if (session.status !== InterviewSessionStatus.COMPLETED) {
    throw new AppError("You can give feedback only after the session is completed.", 400);
  }

  const isInterviewer = session.interviewerId.toString() === userId;

  const isInterviewee = session.intervieweeId.toString() === userId;

  if (!isInterviewer && !isInterviewee) {
    throw new AppError("You are not part of this session.", 403);
  }

  const toUserId = isInterviewer ? session.intervieweeId : session.interviewerId;


  const feedbackEntries = [...(session.feedbackEntries ?? []),];

  const existingIndex = feedbackEntries.findIndex(
    (entry) =>
      entry.fromUserId.toString() === userId &&
      entry.toUserId.toString() === toUserId.toString()
  );

  const now = new Date();

  if (existingIndex >= 0) {
    const existing = feedbackEntries[existingIndex]!;

    existing.feedback = feedback;
    existing.createdAt = now;
  } else {
    feedbackEntries.push({
      fromUserId: new Types.ObjectId(userId),
      toUserId: new Types.ObjectId(toUserId),
      feedback,
      createdAt: now,
    });
  }


  const updatedSession =
    await interviewSessionRepository.updateFeedbackEntries(
      new Types.ObjectId(sessionId),
      feedbackEntries
    );

  return toSessionResponse(updatedSession);
};
