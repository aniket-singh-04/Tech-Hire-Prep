import mongoose from "mongoose";
import { ENV } from "../config/envConfig.js";
import { SessionFeedback } from "../models/session-feedback.model.js";
import { InterviewSession } from "../models/interview-session.model.js";
import { AppError } from "../utils/appError.js";
import { writeAuditLog } from "./audit.service.js";
import { recordPointTransaction } from "./wallet.service.js";

const average = (values: number[]) => values.reduce((sum, value) => sum + value, 0) / values.length;

export const submitFeedback = async (
  sessionId: string,
  fromUserId: string,
  payload: {
    toUserId?: string;
    rating: number;
    rubric: Record<string, number>;
    strengths: string[];
    improvements: string[];
    summary?: string;
    recommendation?: "strong_hire" | "hire" | "mixed" | "no_hire";
  },
  auditContext?: { requestId?: string; ipAddress?: string },
) => {
  const session = await InterviewSession.findById(sessionId);
  if (!session) throw new AppError("Session not found.", 404);

  const participant = session.participants.find((item) => item.userId.toString() === fromUserId);
  if (!participant) throw new AppError("Forbidden", 403);

  const otherParticipant = session.participants.find((item) => item.userId.toString() !== fromUserId);
  const toUserId = payload.toUserId ?? otherParticipant?.userId.toString();
  if (!toUserId) throw new AppError("Feedback target not found.", 400);
  if (toUserId === fromUserId) throw new AppError("Cannot submit feedback for yourself.", 400);

  const existing = await SessionFeedback.findOne({ sessionId: new mongoose.Types.ObjectId(sessionId), fromUserId: new mongoose.Types.ObjectId(fromUserId) }).lean();
  if (existing) throw new AppError("Feedback already submitted for this session.", 409);

  const feedback = await SessionFeedback.create({
    sessionId: new mongoose.Types.ObjectId(sessionId),
    fromUserId: new mongoose.Types.ObjectId(fromUserId),
    toUserId: new mongoose.Types.ObjectId(toUserId),
    rating: payload.rating,
    rubric: payload.rubric,
    strengths: payload.strengths,
    improvements: payload.improvements,
    summary: payload.summary,
    recommendation: payload.recommendation,
  });

  participant.feedbackSubmitted = true;
  const allFeedback = await SessionFeedback.find({ sessionId: new mongoose.Types.ObjectId(sessionId) }).lean();
  const allRatings = allFeedback.map((item) => item.rating);
  const rubrics = allFeedback.map((item) => item.rubric);
  const rubric = {
    communication: average(rubrics.map((item) => item.communication)),
    problemSolving: average(rubrics.map((item) => item.problemSolving)),
    technicalDepth: average(rubrics.map((item) => item.technicalDepth)),
    clarity: average(rubrics.map((item) => item.clarity)),
    collaboration: average(rubrics.map((item) => item.collaboration)),
    timeManagement: average(rubrics.map((item) => item.timeManagement)),
  };
  const overallScore = Number((average(Object.values(rubric)) * 20).toFixed(2));
  session.scorecard = {
    overallScore,
    rubric,
    strengths: Array.from(new Set(allFeedback.flatMap((item) => item.strengths))).slice(0, 5),
    improvements: Array.from(new Set(allFeedback.flatMap((item) => item.improvements))).slice(0, 5),
    generatedAt: new Date(),
  };
  session.ratingSummary = { averageRating: average(allRatings), count: allRatings.length };
  await session.save();

  await writeAuditLog({ actorUserId: fromUserId, action: "session.feedback_submitted", targetType: "session", targetId: sessionId, requestId: auditContext?.requestId, ipAddress: auditContext?.ipAddress });

  const durationMinutes = session.startedAt && session.endedAt ? (session.endedAt.getTime() - session.startedAt.getTime()) / 60000 : 0;
  const qualifiesForFullPoints = session.status === "completed" && durationMinutes >= ENV.MIN_SESSION_POINTS_DURATION_MINUTES;
  await recordPointTransaction({ userId: fromUserId, sessionId, type: "earn", reason: "feedback_submitted", amount: qualifiesForFullPoints ? 10 : 2, idempotencyKey: `feedback:${sessionId}:${fromUserId}`, auditContext, metadata: { qualifiesForFullPoints } });

  const refreshedSession = await InterviewSession.findById(sessionId).lean();
  const submittedCount = refreshedSession?.participants.filter((item) => item.feedbackSubmitted).length ?? 0;
  if (refreshedSession && refreshedSession.status === "completed" && submittedCount === refreshedSession.participants.length) {
    for (const item of refreshedSession.participants) {
      await recordPointTransaction({ userId: item.userId.toString(), sessionId, type: "earn", reason: "session_completed", amount: qualifiesForFullPoints ? 20 : 5, idempotencyKey: `session_completed:${sessionId}:${item.userId.toString()}`, auditContext, metadata: { qualifiesForFullPoints } });
    }
  }

  return {
    feedbackId: feedback._id.toString(),
    scorecard: session.scorecard,
    ratingSummary: session.ratingSummary,
  };
};
