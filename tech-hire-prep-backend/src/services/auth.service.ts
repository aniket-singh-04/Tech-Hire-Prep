import { UserRepository } from "../repositories/user.repository.ts";
import { hashPassword, verifyPassword } from "./password.service.ts";
import { consumeOtpChallenge, createOtpChallenge, } from "./otp.service.ts";
import type { RegisterRequest } from "../types/auth.types.ts";
import { Purpose, UserRole, UserStatus } from "../types/user.types.ts";
import { sendOtpChallengeMail } from "./mail.service.ts";
import { AppError } from "../utils/appError.ts";
import { maskEmail, normalizeEmail } from "../utils/security.ts";
import { assertUniqueUserEmail } from "../validators/user.validation.ts";
import { requestEmailVerificationService } from "./emailVerification.service.ts";
import { Request } from "express";
import { createSession } from "./session.service.ts";
import { serializeUser } from "./serializer.service.ts";
import { SessionRepository } from "../repositories/session.repository.ts";

export const registerService = async (payload: RegisterRequest) => {
  const email = normalizeEmail(payload.email);

  const exists = await UserRepository.existsByEmail(email);

  if (exists) {
    throw new AppError("Email already exists.", 400);
  }

  const passwordHash = await hashPassword(payload.password);

  const { otp, challenge } = await createOtpChallenge({
    purpose: Purpose.REGISTER,
    email,
    pendingUser: {
      name: payload.name.trim(),
      email,
      passwordHash,
      role: payload.role ?? UserRole.STUDENT,
    },
  });

  await sendOtpChallengeMail({
    email,
    otp,
    purpose: Purpose.REGISTER,
  });


  return {
    challengeId: challenge._id.toString(),
    maskedEmail: maskEmail(email),
    requiresOtp: true,
  };
}


export const verifyRegistrationOtpService = async (req: Request, challengeId: string, otp: string) => {
  const challenge = await consumeOtpChallenge({
    challengeId,
    otp,
    purpose: Purpose.REGISTER,
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


export const loginService = async (email: string, password: string,) => {
  if (email?.trim()) {
    email = normalizeEmail(email);
  }

  if (!email) {
    throw new AppError("Email is required", 400);
  }

  const user = await UserRepository.findByEmailWithPassword(email);

  if (!user) {
    throw new AppError("Invalid credentials", 401);
  }

  if (!user.status || user.deletedAt) {
    throw new AppError("Account is disabled", 403);
  }

  const isMatch = await verifyPassword(password, user.password);

  if (!isMatch) {
    throw new AppError("Invalid credentials", 401);
  }

  // Get all active sessions sorted from oldest -> newest
  const activeSessions = await SessionRepository.findActiveByUser(
    user._id.toString(),
  );

  if (activeSessions.length >= 5) {
    const oldestSession = activeSessions[0];

    if (oldestSession) {
      await SessionRepository.revoke(oldestSession._id.toString());
    }
  }

  const { challenge, otp } = await createOtpChallenge({
    userId: user._id,
    purpose: Purpose.LOGIN,
    email: user.email,
    metadata: {
      via: "email",
    },
  });

  await sendOtpChallengeMail({
    email,
    otp,
    purpose: Purpose.LOGIN,
  });

  return {
    challengeId: challenge._id.toString(),
    maskedEmail: maskEmail(user.email),
    requiresOtp: true,
  };
};

export const verifyLoginOtpService = async (
  req: Request,
  challengeId: string,
  otp: string,
) => {
  const challenge = await consumeOtpChallenge({
    challengeId,
    otp,
    purpose: Purpose.LOGIN,
  });

  const userId = challenge.userId?.toString();
  if (!userId) {
    throw new AppError("Login challenge is invalid", 400);
  }

  const user = await UserRepository.findById(userId);

  if ( !user || !user.status || user.deletedAt ) {
    throw new AppError("Account is disabled", 403);
  }

  const sessionPair = await createSession(req, user);

  return {
    ...sessionPair,
    user: await serializeUser(user),
  };
};






