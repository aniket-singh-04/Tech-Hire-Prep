import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler.ts";
import { ok } from "../common/response.ts";
import InterviewSessionModel from "../models/interviewSession.model.ts";
import { AppError } from "../utils/appError.ts";
import { signWebrtcToken } from "../services/token.service.ts";

const stunServers = [
  { urls: "stun:stun.l.google.com:19302" },
];

const getSessionForWebrtc = async (userId: string, sessionId?: string, roomId?: string) => {
  const session = sessionId
    ? await InterviewSessionModel.findById(sessionId)
    : roomId
      ? await InterviewSessionModel.findOne({ roomId })
      : null;

  if (!session) {
    throw new AppError("Session not found", 404);
  }

  if (session.interviewerId.toString() !== userId && session.intervieweeId.toString() !== userId) {
    throw new AppError("Unauthorized access to interview room", 403);
  }

  return session;
};

export const webrtcTokenController = asyncHandler(async (req: Request, res: Response) => {
  const session = await getSessionForWebrtc(req.user!.id, req.body.sessionId, req.body.roomId);

  const token = signWebrtcToken({
    userId: req.user!.id,
    sessionId: session._id.toString(),
    roomId: session.roomId,
    purpose: "webrtc",
  });

  return ok(res, {
    token,
    sessionId: session._id.toString(),
    roomId: session.roomId,
    iceServers: stunServers,
  }, "Token generated successfully");
});

export const webrtcRoomController = asyncHandler(async (req: Request, res: Response) => {
  const session = await getSessionForWebrtc(req.user!.id, req.body.sessionId, req.body.roomId);

  return ok(res, {
    sessionId: session._id.toString(),
    roomId: session.roomId,
    iceServers: stunServers,
    status: session.status,
  }, "Room info fetched");
});

export const webrtcIceCandidateController = asyncHandler(async (req: Request, res: Response) => {
  const session = await getSessionForWebrtc(req.user!.id, req.body.sessionId, req.body.roomId);

  // HTTP fallback for signaling; socket.io remains the real-time path.
  return ok(res, {
    sessionId: session._id.toString(),
    roomId: session.roomId,
    accepted: true,
  }, "Candidate signaled");
});
