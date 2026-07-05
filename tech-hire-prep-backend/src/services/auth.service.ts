import { UserRepository } from "../repositories/user.repository.ts";
import { hashPassword } from "./password.service.ts";
import { consumeOtpChallenge, createRegisterOtp } from "./otp.service.ts";
import type { RegisterRequest } from "../types/auth.types.ts";
import { UserRole, UserStatus } from "../types/user.types.ts";
import { sendRegisterOtpMail } from "./mail.service.ts";
import { AppError } from "../utils/appError.ts";
import { normalizeEmail } from "../utils/security.ts";
import { assertUniqueUserEmail } from "../validators/user.validation.ts";
import { requestEmailVerificationService } from "./emailVerification.service.ts";
import { Request } from "express";
import { createSession } from "./session.service.ts";
import { serializeUser } from "./serializer.service.ts";

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
  };
}


export const verifyRegistrationOtpService = async (req: Request, challengeId: string, otp: string) => {
  const challenge = await consumeOtpChallenge({
    challengeId,
    otp,
    purpose: "REGISTER",
  });

  const pendingUser = challenge.get("pendingUser") as { name?: string; email?: string; passwordHash?: string; role?: UserRole; } | null;

  if (!pendingUser?.name || !pendingUser.email || !pendingUser.passwordHash || !pendingUser.role) {
    throw new AppError("Registration payload is incomplete. Please register again.", 400);
  }

  await assertUniqueUserEmail(pendingUser.email);

  const user = await UserRepository.create({
    name: pendingUser.name.trim(),
    email: pendingUser.email,
    password: pendingUser.passwordHash,
    status: UserStatus.ACTIVE,
    role: pendingUser.role,
  });

  await requestEmailVerificationService(user._id.toString());

  const sessionPair = await createSession(req, user);

  return {
    ...sessionPair,
    user: await serializeUser(user),
  };
};