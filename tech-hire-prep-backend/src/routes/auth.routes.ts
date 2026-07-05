import { Router, type Router as ExpressRouter } from "express";
import { authOtpLimiter, authStartLimiter, passwordResetLimiter, validateBody } from "../middlewares/validation.middleware.ts";
import { confirmEmailVerificationSchema, confirmPasswordChangeSchema, forgotPasswordSchema, loginSchema, registerSchema, verifyOtpSchema } from "../validators/appRouter.schema.ts";
import { authMeController, confirmEmailVerificationController, confirmPasswordChangeOtpController, forgotPasswordWithLinkController, loginController, logoutController, refreshController, registerController, requestEmailVerificationController, requestPasswordChangeOtpController, resetPasswordWithLinkController, verifyLoginOtpController, verifyRegisterOtpController } from "../controllers/auth.controller.ts";
import { protect } from "../middlewares/auth.middleare.ts";

const authRoute: ExpressRouter = Router();

authRoute.post("/register", authStartLimiter, validateBody(registerSchema), registerController);
authRoute.post("/register/verify-otp", authOtpLimiter, validateBody(verifyOtpSchema), verifyRegisterOtpController);
authRoute.post("/login", authStartLimiter, validateBody(loginSchema), loginController);
authRoute.post("/login/verify-otp", authOtpLimiter, validateBody(verifyOtpSchema), verifyLoginOtpController);
authRoute.post("/forgot-password", authStartLimiter, validateBody(forgotPasswordSchema), forgotPasswordWithLinkController);
authRoute.post("/reset-password", passwordResetLimiter, resetPasswordWithLinkController);
authRoute.post("/password-change/request-otp", protect, requestPasswordChangeOtpController);
authRoute.post("/password-change/confirm", protect, validateBody(confirmPasswordChangeSchema), confirmPasswordChangeOtpController);
authRoute.post("/verify-email/request", protect, requestEmailVerificationController);
authRoute.post("/verify-email/confirm", validateBody(confirmEmailVerificationSchema), confirmEmailVerificationController);
authRoute.get("/me", protect, authMeController);
authRoute.post("/refresh", refreshController);
authRoute.post("/logout", logoutController);

export default authRoute;

