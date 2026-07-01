import { sendSuccess } from "../common/http.js";
import { cancelMatchRequest, createMatchRequest, getAvailableSlots, getQueueStatus } from "../services/match.service.js";
import { asyncHandler } from "../utils/asyncHander.js";

export const requestMatch = asyncHandler(async (req, res) => {
  sendSuccess(res, await createMatchRequest(req.user!.id, req.body, { requestId: req.requestId, ipAddress: req.ip }), 201);
});

export const queueStatus = asyncHandler(async (req, res) => {
  sendSuccess(res, await getQueueStatus(req.user!.id));
});

export const cancelMatch = asyncHandler(async (req, res) => {
  sendSuccess(res, await cancelMatchRequest(req.user!.id, { requestId: req.requestId, ipAddress: req.ip }));
});

export const availableSlots = asyncHandler(async (req, res) => {
  sendSuccess(res, await getAvailableSlots(req.user!.id));
});
