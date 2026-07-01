import { sendSuccess } from "../common/http.js";
import { createWebrtcRoom, createWebrtcToken, submitWebrtcSignal } from "../services/webrtc.service.js";
import { asyncHandler } from "../utils/asyncHander.js";

export const webrtcTokenController = asyncHandler(async (req, res) => {
  sendSuccess(res, await createWebrtcToken(req.body.sessionId, req.user!.id));
});

export const webrtcRoomController = asyncHandler(async (req, res) => {
  sendSuccess(res, await createWebrtcRoom(req.body.sessionId, req.user!.id));
});

export const webrtcIceCandidateController = asyncHandler(async (req, res) => {
  sendSuccess(res, await submitWebrtcSignal(req.body.sessionId, req.user!.id, { type: req.body.type, payload: req.body.payload }));
});
