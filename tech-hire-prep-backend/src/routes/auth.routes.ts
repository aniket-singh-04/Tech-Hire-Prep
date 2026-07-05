import { Router, type Router as ExpressRouter } from "express";
import { authOtpLimiter, authStartLimiter, validateBody } from "../common/validation.middleware.ts";
import { loginSchema, registerSchema, verifyOtpSchema } from "../validators/appRouter.schema.ts";
import { loginController, registerController, verifyLoginOtpController, verifyRegisterOtpController } from "../controllers/auth.controller.ts";

const authRoute: ExpressRouter = Router();

authRoute.post("/register", authStartLimiter, validateBody(registerSchema), registerController);
authRoute.post("/register/verify-otp", authOtpLimiter, validateBody(verifyOtpSchema), verifyRegisterOtpController);
authRoute.post("/login", authStartLimiter, validateBody(loginSchema), loginController);
authRoute.post("/login/verify-otp", authOtpLimiter, validateBody(verifyOtpSchema), verifyLoginOtpController);
// authRoute.post("/forgot-password", authStartLimiter, validateBody(forgotPasswordSchema), forgotPassword);
// authRoute.post("/reset-password", passwordResetLimiter, validateBody(resetPasswordSchema), resetPassword);
// authRoute.post("/refresh", refresh);
// authRoute.post("/logout", logout);
// authRoute.get("/me", protect, authMe);
// authRoute.post("/verify-email/request", protect, requestEmailVerification);
// authRoute.post("/verify-email/confirm", validateBody(confirmEmailVerificationSchema), confirmEmailVerification);
// authRoute.post("/password-change/request-otp", protect, requestPasswordChangeOtp);
// authRoute.post("/password-change/confirm", protect, validateBody(confirmPasswordChangeSchema), confirmPasswordChangeOtp);

export default authRoute;

