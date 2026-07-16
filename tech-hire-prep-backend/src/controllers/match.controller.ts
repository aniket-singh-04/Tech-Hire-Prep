import type { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler.ts";
import { requestMatchService, getVisibleMatchRequestService, acceptMatchService, rejectMatchService, cancelMatchService } from "../services/match.service.ts";
import { created, ok } from "../common/response.ts";
import { MatchRepository } from "../repositories/match.repository.ts";
import { Types } from "mongoose";

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
  const result = await getVisibleMatchRequestService(req.user!.id);

  return ok(res, result || null, "Active match request fetched.");
});

export const cancelMatchController = asyncHandler(async (req: Request, res: Response) => {
  const result = await cancelMatchService(req.user!.id);
  return ok(res, result, "Match request cancelled.");
});


