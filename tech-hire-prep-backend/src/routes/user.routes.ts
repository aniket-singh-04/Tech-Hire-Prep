import { Router, type Router as ExpressRouter } from "express";
import { validateBody, validateParams } from "../common/validation.middleware.js";
import { deleteMeController, getMe, getMyProfileController, getUserById, updateAvailabilityController, updateAvatarController, updateMe, updatePreferencesController } from "../controllers/user.controller.js";
import { requireAuth } from "../modules/auth/auth.middleware.js";
import { availabilityUpdateSchema, avatarUpdateSchema, preferencesUpdateSchema, profileUpdateSchema, userIdParamsSchema } from "../modules/profile/profile.schemas.js";

const userRoute: ExpressRouter = Router();

userRoute.use(requireAuth);
userRoute.get("/me", getMe);
userRoute.get("/me/profile", getMyProfileController);
userRoute.patch("/me", validateBody(profileUpdateSchema), updateMe);
userRoute.patch("/me/avatar", validateBody(avatarUpdateSchema), updateAvatarController);
userRoute.patch("/me/preferences", validateBody(preferencesUpdateSchema), updatePreferencesController);
userRoute.patch("/me/availability", validateBody(availabilityUpdateSchema), updateAvailabilityController);
userRoute.delete("/me", deleteMeController);
userRoute.get("/:userId", validateParams(userIdParamsSchema), getUserById);

export default userRoute;

