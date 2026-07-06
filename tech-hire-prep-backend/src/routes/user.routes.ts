import { Router, type Router as ExpressRouter } from "express";
import { protect } from "../middlewares/auth.middleare.ts";
import { validateBody, validateParams } from "../middlewares/validation.middleware.ts";
import { userIdParamsSchema } from "../validators/appRouter.schema.ts";
import { getMyProfileController, getMyPublicProfileController } from "../controllers/user.controller.ts";

const userRoute: ExpressRouter = Router();

userRoute.get("/:username", validateParams(userIdParamsSchema), getMyPublicProfileController);

userRoute.use(protect);
userRoute.get("/me", getMyProfileController);
// userRoute.patch("/me", validateBody(updateProfileSchema), updateMyProfileController);
// userRoute.patch("/me/avatar", validateBody(avatarUpdateSchema), updateAvatarController);
// userRoute.post("/me/avatar/presign", protect, validateBody(createAvatarUploadUrlSchema), createOwnAvatarUploadUrl);
// userRoute.patch("/me/availability", validateBody(updateAvailabilitySchema), updateAvailabilityController);
// userRoute.delete("/me", deleteAccountController);

export default userRoute;