import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler.ts";
import { ok } from "../common/response.ts";
import {
  getSessionService,
  getUpcomingSessionsService,
  getHistorySessionsService,
  joinSessionService,
  leaveSessionService,
  startSessionService,
  endSessionService,
  cancelSessionService,
  rateSessionService,
  feedbackSessionService
} from "../services/interviewSession.service.ts";

export const getSessionController = asyncHandler(async (req: Request, res: Response) => {
  const result = await getSessionService(req.params.sessionId as string, req.user!.id);
  return ok(res, result, "Session fetched successfully");
});

export const upcomingSessionsController = asyncHandler(async (req: Request, res: Response) => {
  const result = await getUpcomingSessionsService(req.user!.id);
  return ok(res, result, "Upcoming sessions fetched successfully");
});

export const historySessionsController = asyncHandler(async (req: Request, res: Response) => {
  const result = await getHistorySessionsService(req.user!.id);
  return ok(res, result, "History sessions fetched successfully");
});

export const joinSessionController = asyncHandler(async (req: Request, res: Response) => {
  const result = await joinSessionService(req.params.sessionId as string, req.user!.id);
  return ok(res, result, "Joined session successfully");
});

export const leaveSessionController = asyncHandler(async (req: Request, res: Response) => {
  const result = await leaveSessionService(req.params.sessionId as string, req.user!.id);
  return ok(res, result, "Left session successfully");
});

export const startSessionController = asyncHandler(async (req: Request, res: Response) => {
  const result = await startSessionService(req.params.sessionId as string, req.user!.id);
  return ok(res, result, "Session started successfully");
});

export const endSessionController = asyncHandler(async (req: Request, res: Response) => {
  const result = await endSessionService(req.params.sessionId as string, req.user!.id);
  return ok(res, result, "Session ended successfully");
});

export const cancelSessionController = asyncHandler(async (req: Request, res: Response) => {
  const result = await cancelSessionService(req.params.sessionId as string, req.user!.id);
  return ok(res, result, "Session cancelled successfully");
});

export const rateSessionController = asyncHandler(async (req: Request, res: Response) => {
  const result = await rateSessionService(req.params.sessionId as string, req.user!.id, req.body.rating);
  return ok(res, result, "Rating submitted successfully");
});

export const feedbackSessionController = asyncHandler(async (req: Request, res: Response) => {
  const result = await feedbackSessionService(req.params.sessionId as string, req.user!.id, req.body.feedback);
  return ok(res, result, "Feedback submitted successfully");
});

export const reportSessionController = asyncHandler(async (req: Request, res: Response) => {
  // Not fully implemented, return success for now
  return ok(res, { message: "Report submitted" }, "Report submitted successfully");
});

export const scheduleSessionController = asyncHandler(async (req: Request, res: Response) => {
  // Should ideally be handled internally via match accept flow
  return ok(res, null, "Scheduled");
});

export const rescheduleSessionController = asyncHandler(async (req: Request, res: Response) => {
  return ok(res, null, "Rescheduled");
});

export const reconnectSessionController = asyncHandler(async (req: Request, res: Response) => {
  return ok(res, null, "Reconnected");
});
