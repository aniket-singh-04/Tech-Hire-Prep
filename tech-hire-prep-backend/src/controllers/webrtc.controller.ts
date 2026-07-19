import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler.ts";
import { ok } from "../common/response.ts";
import { createWebrtcToken, getWebrtcRoomInfo, validateIceCandidate, } from "../services/webrtc.service.ts";

export const webrtcTokenController = asyncHandler(
  async (req: Request, res: Response) => {
    const result = await createWebrtcToken(
      req.user!.id,
      req.body.sessionId,
      req.body.roomId,
    );

    return ok(res, result, "Token generated successfully");
  },
);

export const webrtcRoomController = asyncHandler(
  async (req: Request, res: Response) => {
    const result = await getWebrtcRoomInfo(
      req.user!.id,
      req.body.sessionId,
      req.body.roomId,
    );

    return ok(res, result, "Room info fetched");
  },
);

export const webrtcIceCandidateController = asyncHandler(
  async (req: Request, res: Response) => {
    const result = await validateIceCandidate(
      req.user!.id,
      req.body.sessionId,
      req.body.roomId,
    );

    return ok(res, result, "Candidate signaled");
  },
);
