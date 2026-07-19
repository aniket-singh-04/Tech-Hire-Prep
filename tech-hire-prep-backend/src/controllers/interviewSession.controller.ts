import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler.ts";
import { ok, created } from "../common/response.ts";
import {
  getSessionService,
  getUpcomingSessionsService,
  getHistorySessionsService,
  joinSessionService,
  leaveSessionService,
  cancelSessionService,
  rateSessionService,
  feedbackSessionService,
  scheduleSessionService,
  rescheduleSessionService,
  reconnectSessionService,
  reportSessionService,
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

export const scheduleSessionController = asyncHandler(async (req: Request, res: Response) => {
  const result = await scheduleSessionService(req.user!.id, req.body.sessionId, req.body.startTime, req.body.endTime);
  return created(res, result, "Session scheduled successfully");
});

export const rescheduleSessionController = asyncHandler(async (req: Request, res: Response) => {
  const result = await rescheduleSessionService(req.params.sessionId as string, req.user!.id, req.body.startTime, req.body.endTime);
  return ok(res, result, "Session rescheduled successfully");
});

export const joinSessionController = asyncHandler(async (req: Request, res: Response) => {
  const result = await joinSessionService(req.params.sessionId as string, req.user!.id);
  return ok(res, result, "Joined session successfully");
});

export const leaveSessionController = asyncHandler(async (req: Request, res: Response) => {
  const result = await leaveSessionService(req.params.sessionId as string, req.user!.id);
  return ok(res, result, "Left session successfully");
});

export const cancelSessionController = asyncHandler(async (req: Request, res: Response) => {
  const result = await cancelSessionService(req.params.sessionId as string, req.user!.id);
  return ok(res, result, "Session cancelled successfully");
});

export const reconnectSessionController = asyncHandler(async (req: Request, res: Response) => {
  const result = await reconnectSessionService(req.params.sessionId as string, req.user!.id);
  return ok(res, result, "Reconnected successfully");
});

export const reportSessionController = asyncHandler(async (req: Request, res: Response) => {
  const result = await reportSessionService(req.params.sessionId as string, req.user!.id, req.body.reason);
  return ok(res, result, "Report submitted successfully");
});

export const rateSessionController = asyncHandler(async (req: Request, res: Response) => {
  const result = await rateSessionService(req.params.sessionId as string, req.user!.id, req.body.rating);
  return ok(res, result, "Rating submitted successfully");
});

export const feedbackSessionController = asyncHandler(async (req: Request, res: Response) => {
  const result = await feedbackSessionService(req.params.sessionId as string, req.user!.id, req.body.feedback);
  return ok(res, result, "Feedback submitted successfully");
});
