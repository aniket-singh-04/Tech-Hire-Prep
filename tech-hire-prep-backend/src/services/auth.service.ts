import { UserRepository } from "../repositories/user.repository.ts";
import { hashPassword } from "./password.service.ts";
import { createRegisterOtp } from "./otp.service.ts";
import type { RegisterRequest } from "../types/auth.types.ts";
import { UserRole } from "../types/user.types.ts";
import { sendRegisterOtpMail } from "./mail.service.ts";
import { AppError } from "../utils/appError.ts";
import { normalizeEmail } from "../utils/security.ts";

export async function registerService(payload: RegisterRequest) {
  const email = normalizeEmail(payload.email);

  const exists = await UserRepository.existsByEmail(email);

  if (exists) {
    throw new AppError("Email already exists.", 400);
  }

  const passwordHash = await hashPassword(payload.password);

  const { otp, challenge } = await createRegisterOtp({
    name: payload.name.trim(),
    email,
    passwordHash,
    role: payload.role ?? UserRole.STUDENT,
  });

  await sendRegisterOtpMail(email, otp);

  return {
    challengeId: challenge._id.toString(),
    maskedEmail: email,
    requiresOtp: true,
    message: "OTP sent successfully.",
  };
}