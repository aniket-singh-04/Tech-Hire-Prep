import { Router, type Router as ExpressRouter } from "express";
import { validateBody, validateParams } from "../middlewares/validation.middleware.ts";
import { protect } from "../middlewares/auth.middleare.ts";

const sessionRoute: ExpressRouter = Router();

sessionRoute.use(protect);
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

