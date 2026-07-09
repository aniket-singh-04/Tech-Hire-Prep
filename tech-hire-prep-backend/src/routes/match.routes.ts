import { Router, type Router as ExpressRouter } from "express";
import { protect } from "../middlewares/auth.middleare.ts";
import { validateBody, validateQuery } from "../middlewares/validation.middleware.ts";
import { matchRequestSchema } from "../validators/match.validation.ts";
import { requestMatchController } from "../controllers/match.controller.ts";

const matchRoute: ExpressRouter = Router();

matchRoute.use(protect);
matchRoute.post("/request", validateBody(matchRequestSchema), requestMatchController);
matchRoute.get("/queue-status", getQueueStatusController);
// matchRoute.post("/cancel", cancelMatchController);
// matchRoute.get("/available-slots", validateQuery(availableSlotsQuerySchema), getAvailableSlotsController);

export default matchRoute;