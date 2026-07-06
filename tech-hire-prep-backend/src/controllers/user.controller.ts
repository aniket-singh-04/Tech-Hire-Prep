import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler.ts";
import { ok } from "../common/response.ts";
import { getMyProfileService, getMyPublicProfileService } from "../services/user.service.ts";

export const getMyPublicProfileController = asyncHandler(async (req:Request, res:Response) => {
    const result = await getMyPublicProfileService(String(req.params!.username));
    return ok(res, result, "This is my public Profile.")
});

export const getMyProfileController = asyncHandler(async (req:Request, res:Response) => {
    const result = await getMyProfileService(req.user!.id)
  return ok(res, result, "This is you Profile.");
});



