import { Router, type Router as ExpressRouter } from "express";
import { validateBody } from "../common/validation.middleware.js";
import { availableSlots, cancelMatch, queueStatus, requestMatch } from "../controllers/match.controller.js";
import { requireAuth } from "../modules/auth/auth.middleware.js";
import { matchRequestSchema } from "../modules/matches/match.schemas.js";

const matchRoute: ExpressRouter = Router();

matchRoute.use(requireAuth);
matchRoute.post("/request", validateBody(matchRequestSchema), requestMatch);
matchRoute.get("/queue-status", queueStatus);
matchRoute.post("/cancel", cancelMatch);
matchRoute.get("/available-slots", availableSlots);

export default matchRoute;

