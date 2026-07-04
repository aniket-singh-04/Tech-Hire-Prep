import { Router, type Router as ExpressRouter } from "express";
import { authStartLimiter, validateBody } from "../common/validation.middleware.ts";
import { registerService } from "../services/auth.service.ts";
import { registerSchema } from "../validators/register.schema.ts";

const authRoute: ExpressRouter = Router();

authRoute.post("/register", authStartLimiter, validateBody(registerSchema), registerService);
// authRoute.post("/register/verify-otp", authOtpLimiter, validateBody(verifyOtpSchema), verifyRegisterOtp);
// authRoute.post("/login", authStartLimiter, validateBody(loginSchema), login);
// authRoute.post("/login/verify-otp", authOtpLimiter, validateBody(verifyOtpSchema), verifyLoginOtp);
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

