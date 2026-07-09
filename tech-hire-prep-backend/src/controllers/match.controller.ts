import type { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler.ts";
import { requestMatchService, acceptMatchService, rejectMatchService } from "../services/match.service.ts";
import { created, ok } from "../common/response.ts";
import { MatchRepository } from "../repositories/match.repository.ts";
import { Types } from "mongoose";
import { matchStatus } from "../types/match.types.ts";

export const requestMatchController = asyncHandler(async (req: Request, res: Response) => {
  const result = await requestMatchService({ userId: req.user!.id, data: req.body, });

  return created(res, result, "Your interview request were created.");
});

export const acceptMatchController = asyncHandler(async (req: Request, res: Response) => {
  const result = await acceptMatchService(req.user!.id, req.params.requestId as string);

  return ok(res, result, "Interview request accepted.");
});

export const rejectMatchController = asyncHandler(async (req: Request, res: Response) => {
  const result = await rejectMatchService(req.user!.id, req.params.requestId as string);

  return ok(res, result, "Interview request rejected.");
});

export const getActiveMatchController = asyncHandler(async (req: Request, res: Response) => {
  const result = await MatchRepository.findActiveRequestByUserId(new Types.ObjectId(req.user!.id));

  return ok(res, result || null, "Active match request fetched.");
});

export const cancelMatchController = asyncHandler(async (req: Request, res: Response) => {
  const active = await MatchRepository.findActiveRequestByUserId(new Types.ObjectId(req.user!.id));
  if (active) {
    await MatchRepository.updateRequestStatus(active._id as Types.ObjectId, matchStatus.CANCELLED);
  }
  return ok(res, null, "Match request cancelled.");
});
