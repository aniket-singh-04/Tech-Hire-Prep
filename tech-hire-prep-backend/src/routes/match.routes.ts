import { Router, type Router as ExpressRouter } from "express";
import { protect } from "../middlewares/auth.middleare.ts";
import { validateBody, validateQuery } from "../middlewares/validation.middleware.ts";
import { matchRequestSchema } from "../validators/match.validation.ts";
import { requestMatchController, acceptMatchController, rejectMatchController, getActiveMatchController, cancelMatchController } from "../controllers/match.controller.ts";

const matchRoute: ExpressRouter = Router();

matchRoute.use(protect);
matchRoute.post("/request", validateBody(matchRequestSchema), requestMatchController);
matchRoute.get("/active", getActiveMatchController);
matchRoute.post("/cancel", cancelMatchController);
matchRoute.post("/:requestId/accept", acceptMatchController);
matchRoute.post("/:requestId/reject", rejectMatchController);

export default matchRoute;