import { sendNoContent, sendSuccess } from "../common/http.js";
import { deleteCurrentUser, getCurrentUser, getMyProfile, getPublicUserProfile, updateAvatar, updateMyProfile } from "../services/profile.service.js";
import { asyncHandler } from "../utils/asyncHander.js";

export const getMe = asyncHandler(async (req, res) => {
  sendSuccess(res, await getCurrentUser(req.user!.id));
});

export const getMyProfileController = asyncHandler(async (req, res) => {
  sendSuccess(res, await getMyProfile(req.user!.id));
});

export const updateMe = asyncHandler(async (req, res) => {
  sendSuccess(res, await updateMyProfile(req.user!.id, req.body, { requestId: req.requestId, ipAddress: req.ip }));
});

export const getUserById = asyncHandler(async (req, res) => {
  sendSuccess(res, await getPublicUserProfile(String(req.params.userId)));
});

export const updateAvatarController = asyncHandler(async (req, res) => {
  sendSuccess(res, await updateAvatar(req.user!.id, req.body.avatarUrl, { requestId: req.requestId, ipAddress: req.ip }));
});

export const updatePreferencesController = asyncHandler(async (req, res) => {
  sendSuccess(res, await updateMyProfile(req.user!.id, req.body, { requestId: req.requestId, ipAddress: req.ip }));
});

export const updateAvailabilityController = asyncHandler(async (req, res) => {
  sendSuccess(res, await updateMyProfile(req.user!.id, req.body, { requestId: req.requestId, ipAddress: req.ip }));
});

export const deleteMeController = asyncHandler(async (req, res) => {
  await deleteCurrentUser(req.user!.id, { requestId: req.requestId, ipAddress: req.ip });
  sendNoContent(res);
});
