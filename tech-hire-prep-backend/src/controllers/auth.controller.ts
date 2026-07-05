import type { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler.ts";
import { loginService, registerService, verifyLoginOtpService, verifyRegistrationOtpService } from "../services/auth.service.ts";
import { accepted, created } from "../common/response.ts";
import { LoginInput, VerifyOtp } from "../validators/appRouter.schema.ts";



export const registerController = asyncHandler(
  async (req: Request, res: Response) => {
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



