import { Router, type Router as ExpressRouter } from "express";
import { protect } from "../middlewares/auth.middleare.ts";
import { validateBody, validateParams } from "../middlewares/validation.middleware.ts";
import { createOwnAvatarUploadUrlController, deleteAccountController, getMyProfileController, getMyPublicProfileController, saveAvatarController, updateAvailabilityController, updateMyProfileController } from "../controllers/user.controller.ts";
import { availabilityUpdateSchema, createAvatarUploadUrlSchema, profileUpdateSchema, saveAvatarSchema } from "../validators/user.validation.ts";
import { z } from "zod";

const usernameParamsSchema = z.object({
  username: z.string().trim().min(3).max(30),
}).strict();

const userRoute: ExpressRouter = Router();

userRoute.get("/:username", validateParams(usernameParamsSchema), getMyPublicProfileController);

userRoute.use(protect);
userRoute.get("/me", getMyProfileController);
userRoute.patch("/me", validateBody(profileUpdateSchema), updateMyProfileController);
userRoute.post("/me/avatar/presign", protect, validateBody(createAvatarUploadUrlSchema), createOwnAvatarUploadUrlController);
userRoute.patch("/me/avatar", validateBody(saveAvatarSchema), saveAvatarController);
userRoute.patch("/me/availability", validateBody(availabilityUpdateSchema), updateAvailabilityController);
userRoute.delete("/me", deleteAccountController);

export default userRoute;