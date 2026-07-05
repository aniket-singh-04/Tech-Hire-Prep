import type { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler.ts";
import { authMeService, confirmEmailVerificationService, confirmPasswordChangeOtpService, loginService, logoutService, refreshSessionService, registerService, requestForgotPasswordLinkService, requestPasswordChangeOtpService, resetPasswordWithLinkTokenService, verifyLoginOtpService, verifyRegistrationOtpService } from "../services/auth.service.ts";
import { accepted, created, ok } from "../common/response.ts";
import { LoginInput, VerifyOtp } from "../validators/appRouter.schema.ts";
import { AppError } from "../utils/appError.ts";
import { requestEmailVerificationService } from "../services/emailVerification.service.ts";
import { VerificationPurpose } from "../types/emailverify.type.ts";



export const registerController = asyncHandler(async (req: Request, res: Response) => {
  const result = await registerService(req.body);

  return created(
    res,
    result,
    "OTP sent successfully."
  );
},
);

const refreshCookieOptions = {
  httpOnly: true,
  secure: true,
  sameSite: "strict" as const,
  signed: true,
};


export const verifyRegisterOtpController = asyncHandler(async (req: Request, res: Response) => {
  const { challengeId, otp } = req.body as VerifyOtp;
  const result = await verifyRegistrationOtpService(req, challengeId, otp);

  res.cookie("rid", result.refreshToken, {
    ...refreshCookieOptions,
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  return accepted(
    res,
    {
      accessToken: result.accessToken,
      user: result.user,
    },
    "Registration completed successfully"
  );

});


export const loginController = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body as LoginInput;
  const result = await loginService(email, password);

  return created(
    res,
    result,
    "OTP sent successfully."
  );
});

export const verifyLoginOtpController = asyncHandler(async (req: Request, res: Response) => {
  const { challengeId, otp } = req.body as VerifyOtp;
  const result = await verifyLoginOtpService(req, challengeId, otp);

  res.cookie("rid", result.refreshToken, {
    ...refreshCookieOptions,
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  return accepted(
    res,
    {
      accessToken: result.accessToken,
      user: result.user,
    },
    "Login completed successfully"
  );
});

export const forgotPasswordWithLinkController = asyncHandler(async (req: Request, res: Response) => {
  const result = await requestForgotPasswordLinkService(req.body);

  return ok(res, result, "Password forgot link send successfully on email.")
});

export const resetPasswordWithLinkController = asyncHandler(async (req: Request, res: Response) => {
  const result = await resetPasswordWithLinkTokenService(req.body);

  return ok(res, result, "Password forgot successfully.")
});

export const requestPasswordChangeOtpController = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user?.id) {
    throw new AppError("Unauthorized", 401);
  }

  const result = await requestPasswordChangeOtpService(req.user.id.toString());

  return ok(res, result, "OTP sent successfully for password changing.")
},
);

export const confirmPasswordChangeOtpController = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user?.id) {
    throw new AppError("Unauthorized", 401);
  }

  const result = await confirmPasswordChangeOtpService({
    userId: req.user.id.toString(),
    challengeId: req.body.challengeId,
    otp: req.body.otp,
    newPassword: req.body.newPassword,
  });

  return ok(res, result, "Password changed.")
},
);

export const requestEmailVerificationController = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user?.id) {
    throw new AppError("Unauthorized", 401);
  }

  const result = await requestEmailVerificationService({
    userId: req.user.id,
    purpose: VerificationPurpose.EMAIL_VERIFICATION
  });

  return ok(res, result, "Email verification link was send on email.");
},
);

export const confirmEmailVerificationController = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user?.id) {
    throw new AppError("Unauthorized", 401);
  }

  const { token } = req.body;
  const result = await confirmEmailVerificationService({ userId: req.user.id, token });

  return ok(res, result, "Email is verified.")
},
);

export const authMeController = asyncHandler(async (req, res: Response) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    throw new AppError("Unauthorized", 401);
  }
  const user = await authMeService(authHeader.slice("Bearer ".length));

  return ok(res, user, "User is verified.")
});

export const refreshController = asyncHandler(async (req: Request, res: Response) => {
  const refreshToken = req.signedCookies?.rid;
  if (!refreshToken) {
    throw new AppError("Refresh token missing", 401);
  }

  const result = await refreshSessionService(refreshToken);
  res.cookie("rid", result.refreshToken, { ...refreshCookieOptions, maxAge: 7 * 24 * 60 * 60 * 1000, });

  return ok(res, {
    accessToken: result.accessToken,
    user: result.user,
  })
});

export const logoutController = asyncHandler(async (req:Request, res: Response) => {
  const refreshToken = req.signedCookies?.rid;
  const authHeader = req.headers.authorization;

  if (!refreshToken && !authHeader?.startsWith("Bearer ")) {
    throw new AppError("No active session found", 401);
  }

  if (refreshToken) {
    await logoutService(refreshToken, true);
  } else if (authHeader) {
    await logoutService(authHeader.slice("Bearer ".length));
  }

  res.clearCookie("rid", refreshCookieOptions);

  return ok(res, {
    message: "Logged out successfully",
  });
});


