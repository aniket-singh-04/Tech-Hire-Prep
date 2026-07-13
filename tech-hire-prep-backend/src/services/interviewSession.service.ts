import InterviewSessionModel, { InterviewSessionStatus } from "../models/interviewSession.model.ts";
import { emitToUser } from "../socket/index.ts";
import { AppError } from "../utils/appError.ts";
import { Types } from "mongoose";
import { PaymentRepository } from "../repositories/payment.repository.ts";

export const getSessionService = async (sessionId: string, userId: string) => {
  const session = await InterviewSessionModel.findById(sessionId)
    .populate("matchId", "interviewType preferredRole difficulty preferredLanguage duration description");

  if (!session) throw new AppError("Session not found", 404);

  if (session.interviewerId.toString() !== userId && session.intervieweeId.toString() !== userId) {
    throw new AppError("Unauthorized access to session", 403);
  }

  return session;
};

export const getUpcomingSessionsService = async (userId: string) => {
  return InterviewSessionModel.find({
    $or: [{ interviewerId: userId }, { intervieweeId: userId }],
    status: InterviewSessionStatus.SCHEDULED,
  }).sort({ createdAt: 1 });
};

export const getHistorySessionsService = async (userId: string) => {
  return InterviewSessionModel.find({
    $or: [{ interviewerId: userId }, { intervieweeId: userId }],
    status: { $in: [InterviewSessionStatus.COMPLETED, InterviewSessionStatus.CANCELLED] },
  }).sort({ createdAt: -1 });
};

export const joinSessionService = async (sessionId: string, userId: string) => {
  const session = await InterviewSessionModel.findById(sessionId);
  if (!session) throw new AppError("Session not found", 404);

  const isInterviewer = session.interviewerId.toString() === userId;
  const isInterviewee = session.intervieweeId.toString() === userId;

  if (!isInterviewer && !isInterviewee) {
    throw new AppError("Unauthorized", 403);
  }

  // --- Payment gate ---
  // Only the person who requested the interview (interviewee) needs to pay.
  if (isInterviewee) {
    const confirmedPayment = await PaymentRepository.findPaidByUserAndSession(
      userId,
      sessionId
    );

    if (!confirmedPayment) {
      throw new AppError(
        "Payment required to join this session. Please complete the payment and try again.",
        402
      );
    }
  }
  // --- End payment gate ---

  const update = isInterviewer ? { interviewerJoinedAt: new Date() } : { intervieweeJoinedAt: new Date() };
  
  const updatedSession = await InterviewSessionModel.findByIdAndUpdate(
    sessionId,
    { $set: update },
    { returnDocument: "after" }
  );

  return updatedSession;
};

export const leaveSessionService = async (sessionId: string, userId: string) => {
  // Can just emit a notification to the other peer if needed
  const session = await InterviewSessionModel.findById(sessionId);
  if (!session) throw new AppError("Session not found", 404);

  const otherUserId = session.interviewerId.toString() === userId ? session.intervieweeId : session.interviewerId;
  emitToUser(otherUserId.toString(), "peer-left", { sessionId });

  return { message: "Left session" };
};

export const startSessionService = async (sessionId: string, userId: string) => {
  const session = await InterviewSessionModel.findOneAndUpdate(
    { _id: sessionId, status: InterviewSessionStatus.SCHEDULED },
    { $set: { status: InterviewSessionStatus.ACTIVE, startTime: new Date() } },
    { returnDocument: "after" }
  );

  if (!session) throw new AppError("Cannot start session", 400);

  const otherUserId = session.interviewerId.toString() === userId ? session.intervieweeId : session.interviewerId;
  emitToUser(otherUserId.toString(), "session-started", { sessionId });

  return session;
};

export const endSessionService = async (sessionId: string, userId: string) => {
  const session = await InterviewSessionModel.findOneAndUpdate(
    { _id: sessionId, status: InterviewSessionStatus.ACTIVE },
    { $set: { status: InterviewSessionStatus.COMPLETED, endTime: new Date() } },
    { returnDocument: "after" }
  );

  if (!session) throw new AppError("Cannot end session", 400);

  const otherUserId = session.interviewerId.toString() === userId ? session.intervieweeId : session.interviewerId;
  emitToUser(otherUserId.toString(), "session-ended", { sessionId });

  return session;
};

export const cancelSessionService = async (sessionId: string, userId: string) => {
  const session = await InterviewSessionModel.findOneAndUpdate(
    { _id: sessionId, status: InterviewSessionStatus.SCHEDULED },
    { $set: { status: InterviewSessionStatus.CANCELLED } },
    { returnDocument: "after" }
  );

  if (!session) throw new AppError("Cannot cancel session", 400);

  const otherUserId = session.interviewerId.toString() === userId ? session.intervieweeId : session.interviewerId;
  emitToUser(otherUserId.toString(), "session-cancelled", { sessionId });

  return session;
};

export const rateSessionService = async (sessionId: string, userId: string, rating: number) => {
  const session = await InterviewSessionModel.findById(sessionId);
  if (!session) throw new AppError("Session not found", 404);

  if (session.interviewerId.toString() !== userId && session.intervieweeId.toString() !== userId) {
    throw new AppError("Unauthorized access to session", 403);
  }

  return InterviewSessionModel.findByIdAndUpdate(
    sessionId,
    { $set: { rating } },
    { returnDocument: "after" }
  );
};

export const feedbackSessionService = async (sessionId: string, userId: string, feedback: string) => {
  const session = await InterviewSessionModel.findById(sessionId);
  if (!session) throw new AppError("Session not found", 404);

  if (session.interviewerId.toString() !== userId && session.intervieweeId.toString() !== userId) {
    throw new AppError("Unauthorized access to session", 403);
  }

  return InterviewSessionModel.findByIdAndUpdate(
    sessionId,
    { $set: { feedback } },
    { returnDocument: "after" }
  );
};
