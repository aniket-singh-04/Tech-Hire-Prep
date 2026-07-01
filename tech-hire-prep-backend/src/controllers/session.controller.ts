import { sendSuccess } from "../common/http.js";
import { submitFeedback } from "../services/feedback.service.js";
import { cancelSession, endSession, getSessionById, getSessionHistory, getUpcomingSessions, joinSession, leaveSession, rateSession, reconnectSession, reportSession, rescheduleSession, scheduleSession, startSession } from "../services/session.service.js";
import { asyncHandler } from "../utils/asyncHander.js";

export const scheduleSessionController = asyncHandler(async (req, res) => {
  sendSuccess(res, await scheduleSession(req.user!.id, req.body, { requestId: req.requestId, ipAddress: req.ip }), 201);
});

export const upcomingSessionsController = asyncHandler(async (req, res) => {
  sendSuccess(res, await getUpcomingSessions(req.user!.id));
});

export const historySessionsController = asyncHandler(async (req, res) => {
  sendSuccess(res, await getSessionHistory(req.user!.id));
});

export const getSessionController = asyncHandler(async (req, res) => {
  const sessionId = String(req.params.sessionId);
  sendSuccess(res, await getSessionById(sessionId, req.user!.id));
});

export const rescheduleSessionController = asyncHandler(async (req, res) => {
  const sessionId = String(req.params.sessionId);
  sendSuccess(res, await rescheduleSession(sessionId, req.user!.id, req.body.scheduledAt, { requestId: req.requestId, ipAddress: req.ip }));
});

export const cancelSessionController = asyncHandler(async (req, res) => {
  const sessionId = String(req.params.sessionId);
  sendSuccess(res, await cancelSession(sessionId, req.user!.id, { requestId: req.requestId, ipAddress: req.ip }));
});

export const joinSessionController = asyncHandler(async (req, res) => {
  const sessionId = String(req.params.sessionId);
  sendSuccess(res, await joinSession(sessionId, req.user!.id, { requestId: req.requestId, ipAddress: req.ip }));
});

export const leaveSessionController = asyncHandler(async (req, res) => {
  const sessionId = String(req.params.sessionId);
  sendSuccess(res, await leaveSession(sessionId, req.user!.id, { requestId: req.requestId, ipAddress: req.ip }));
});

export const startSessionController = asyncHandler(async (req, res) => {
  const sessionId = String(req.params.sessionId);
  sendSuccess(res, await startSession(sessionId, req.user!.id, { requestId: req.requestId, ipAddress: req.ip }));
});

export const endSessionController = asyncHandler(async (req, res) => {
  const sessionId = String(req.params.sessionId);
  sendSuccess(res, await endSession(sessionId, req.user!.id, { requestId: req.requestId, ipAddress: req.ip }));
});

export const reconnectSessionController = asyncHandler(async (req, res) => {
  const sessionId = String(req.params.sessionId);
  sendSuccess(res, await reconnectSession(sessionId, req.user!.id));
});

export const reportSessionController = asyncHandler(async (req, res) => {
  const sessionId = String(req.params.sessionId);
  sendSuccess(res, await reportSession(sessionId, req.user!.id, req.body.reason, { requestId: req.requestId, ipAddress: req.ip }));
});

export const rateSessionController = asyncHandler(async (req, res) => {
  const sessionId = String(req.params.sessionId);
  sendSuccess(res, await rateSession(sessionId, req.user!.id, req.body.rating, { requestId: req.requestId, ipAddress: req.ip }));
});

export const feedbackSessionController = asyncHandler(async (req, res) => {
  const sessionId = String(req.params.sessionId);
  sendSuccess(res, await submitFeedback(sessionId, req.user!.id, req.body, { requestId: req.requestId, ipAddress: req.ip }), 201);
});
