import { Router, type Router as ExpressRouter } from "express";
import { protect } from "../middlewares/auth.middleare.ts";
import { validateBody } from "../middlewares/validation.middleware.ts";
import { webrtcTokenSchema, webrtcSignalSchema } from "../validators/webrtc.validation.ts";
import { webrtcTokenController, webrtcRoomController, webrtcIceCandidateController } from "../controllers/webrtc.controller.ts";

const webrtcRoute: ExpressRouter = Router();

webrtcRoute.use(protect);
webrtcRoute.post("/token", validateBody(webrtcTokenSchema), webrtcTokenController);
webrtcRoute.post("/room", validateBody(webrtcTokenSchema), webrtcRoomController);
webrtcRoute.post("/ice-candidate", validateBody(webrtcSignalSchema), webrtcIceCandidateController);

export default webrtcRoute;
