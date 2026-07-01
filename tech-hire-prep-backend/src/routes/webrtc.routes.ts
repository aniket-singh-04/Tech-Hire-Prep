import { Router, type Router as ExpressRouter } from "express";
import { validateBody } from "../common/validation.middleware.js";
import { webrtcIceCandidateController, webrtcRoomController, webrtcTokenController } from "../controllers/webrtc.controller.js";
import { requireAuth } from "../modules/auth/auth.middleware.js";
import { webrtcSignalSchema, webrtcTokenSchema } from "../modules/webrtc/webrtc.schemas.js";

const webrtcRoute: ExpressRouter = Router();

webrtcRoute.use(requireAuth);
webrtcRoute.post("/token", validateBody(webrtcTokenSchema), webrtcTokenController);
webrtcRoute.post("/room", validateBody(webrtcTokenSchema), webrtcRoomController);
webrtcRoute.post("/ice-candidate", validateBody(webrtcSignalSchema), webrtcIceCandidateController);

export default webrtcRoute;

