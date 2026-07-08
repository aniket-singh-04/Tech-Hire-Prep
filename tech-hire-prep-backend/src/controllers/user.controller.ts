import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler.ts";
import { created, ok } from "../common/response.ts";
import { createUserAvatarUploadUrlService, deleteAccountService, getMyProfileService, getMyPublicProfileService, saveUserAvatarService, updateMyAvailabilityService, updateMyProfileService } from "../services/user.service.ts";

export const getMyPublicProfileController = asyncHandler(async (req: Request, res: Response) => {
  const result = await getMyPublicProfileService(String(req.params!.username));
  return ok(res, result, "This is my public Profile.")
});

export const getMyProfileController = asyncHandler(async (req: Request, res: Response) => {
  const result = await getMyProfileService({ userId: req.user!.id })
  return ok(res, result, "This is you Profile.");
});

export const updateMyProfileController = asyncHandler(async (req: Request, res: Response) => {
  const result = await updateMyProfileService(req.user!.id, req.body,);
  return ok(res, result, "Your profile is updated.");
});

export const createOwnAvatarUploadUrlController = asyncHandler(async (req: Request<{}, {}, { fileName: string, contentType: string }>, res: Response,) => {
  const data = await createUserAvatarUploadUrlService(req, req.body);
  return created(res, data, "Profile image url is creted.")
},
);

export const saveAvatarController = asyncHandler(async (req: Request, res: Response) => {
  const result = await saveUserAvatarService(req, req.body);

  return ok(res, result, "Profile image uploaded successfully.");
},
);

export const updateAvailabilityController = asyncHandler(async (req: Request, res: Response) => {
  const result = await updateMyAvailabilityService(req.user!.id, req.body);
  return ok(res, result, "Your availability was updated.")
})

export const deleteAccountController = asyncHandler(async (req: Request, res: Response) => {
  const result = await deleteAccountService({ userId: req.user!.id });
  return ok(res, result, "Your account was deleted.")
})


