import { Router, type Router as ExpressRouter } from "express";
import { validateBody, validateParams } from "../common/validation.middleware.js";
import { cancelSessionController, endSessionController, feedbackSessionController, getSessionController, historySessionsController, joinSessionController, leaveSessionController, rateSessionController, reconnectSessionController, reportSessionController, rescheduleSessionController, scheduleSessionController, startSessionController, upcomingSessionsController } from "../controllers/session.controller.js";
import { requireAuth } from "../modules/auth/auth.middleware.js";
import { feedbackSchema, rateSessionSchema, reportSessionSchema, rescheduleSessionSchema, scheduleSessionSchema, sessionIdParamsSchema } from "../modules/sessions/session.schemas.js";

const sessionRoute: ExpressRouter = Router();

sessionRoute.use(requireAuth);
sessionRoute.post("/schedule", validateBody(scheduleSessionSchema), scheduleSessionController);
sessionRoute.get("/upcoming", upcomingSessionsController);
sessionRoute.get("/history", historySessionsController);
sessionRoute.get("/:sessionId", validateParams(sessionIdParamsSchema), getSessionController);
sessionRoute.patch("/:sessionId/reschedule", validateParams(sessionIdParamsSchema), validateBody(rescheduleSessionSchema), rescheduleSessionController);
sessionRoute.post("/:sessionId/cancel", validateParams(sessionIdParamsSchema), cancelSessionController);
sessionRoute.post("/:sessionId/join", validateParams(sessionIdParamsSchema), joinSessionController);
sessionRoute.post("/:sessionId/leave", validateParams(sessionIdParamsSchema), leaveSessionController);
sessionRoute.post("/:sessionId/start", validateParams(sessionIdParamsSchema), startSessionController);
sessionRoute.post("/:sessionId/end", validateParams(sessionIdParamsSchema), endSessionController);
sessionRoute.post("/:sessionId/reconnect", validateParams(sessionIdParamsSchema), reconnectSessionController);
sessionRoute.post("/:sessionId/report", validateParams(sessionIdParamsSchema), validateBody(reportSessionSchema), reportSessionController);
sessionRoute.post("/:sessionId/rate", validateParams(sessionIdParamsSchema), validateBody(rateSessionSchema), rateSessionController);
sessionRoute.post("/:sessionId/feedback", validateParams(sessionIdParamsSchema), validateBody(feedbackSchema), feedbackSessionController);

export default sessionRoute;

