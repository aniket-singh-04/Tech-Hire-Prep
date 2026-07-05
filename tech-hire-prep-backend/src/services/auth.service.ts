import { UserRepository } from "../repositories/user.repository.ts";
import { hashPassword, verifyPassword } from "./password.service.ts";
import { consumeOtpChallenge, createOtpChallenge, } from "./otp.service.ts";
import type { RegisterRequest } from "../types/auth.types.ts";
import { OtpPurpose, UserRole, UserStatus } from "../types/user.types.ts";
import { sendOtpChallengeMail } from "./mail.service.ts";
import { AppError } from "../utils/appError.ts";
import { maskEmail, normalizeEmail, sha256 } from "../utils/security.ts";
import { assertUniqueUserEmail } from "../validators/user.validation.ts";
import { requestEmailVerificationService, sendVerificationEmail } from "./emailVerification.service.ts";
import { Request } from "express";
import { buildAccessPayload, createSession } from "./session.service.ts";
import { serializeUser } from "./serializer.service.ts";
import { SessionRepository } from "../repositories/session.repository.ts";
import { VerificationPurpose } from "../types/emailverify.type.ts";
import { Types } from "mongoose";
import { VerificationRepo } from "../repositories/verification.repository.ts";
import { signAccessToken, signRefreshToken, verifyAccessToken, verifyRefreshToken } from "./token.service.ts";
import { randomUUID } from "node:crypto";

export const registerService = async (payload: RegisterRequest) => {
  const email = normalizeEmail(payload.email);

  const exists = await UserRepository.existsByEmail(email);

  if (exists) {
    throw new AppError("Email already exists.", 400);
  }

  const passwordHash = await hashPassword(payload.password);

  const { otp, challenge } = await createOtpChallenge({
    purpose: OtpPurpose.REGISTER,
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
    purpose: OtpPurpose.REGISTER,
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
    purpose: OtpPurpose.REGISTER,
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

  await requestEmailVerificationService({ userId: user._id.toString(), purpose: VerificationPurpose.EMAIL_VERIFICATION });

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
    purpose: OtpPurpose.LOGIN,
    email: user.email,
    metadata: {
      via: "email",
    },
  });

  await sendOtpChallengeMail({
    email,
    otp,
    purpose: OtpPurpose.LOGIN,
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
    purpose: OtpPurpose.LOGIN,
  });

  const userId = challenge.userId?.toString();
  if (!userId) {
    throw new AppError("Login challenge is invalid", 400);
  }

  const user = await UserRepository.findById(userId);

  if (!user || !user.status || user.deletedAt) {
    throw new AppError("Account is disabled", 403);
  }

  const sessionPair = await createSession(req, user);

  return {
    ...sessionPair,
    user: await serializeUser(user),
  };
};

export const requestForgotPasswordLinkService = async (payload: { email: string; }) => {
  const email = payload.email?.trim() ? normalizeEmail(payload.email) : undefined;

  if (!email) {
    throw new AppError("Email is required", 400);
  }

  const user = await UserRepository.findByEmail(email);

  if (!user) {
    throw new AppError("We could not find an account for the provided details", 404);
  }

  await sendVerificationEmail({
    userId: user._id.toString(),
    email: user.email,
    purpose: VerificationPurpose.EMAIL_VERIFICATION
  });

  return {
    maskedEmail: maskEmail(user.email),
  };
};


export const resetPasswordWithLinkTokenService = async (input: { userId: string; token: string; password: string; }) => {

  const verification =
    await VerificationRepo.findActiveByToken({
      userId: input.userId,
      purpose: VerificationPurpose.FORGOT_PASSWORD,
      codeHash: sha256(input.token),
    });

  if (!verification) {
    throw new AppError("Invalid or expired reset link.", 400);
  }

  if (verification.expiresAt < new Date()) {
    throw new AppError("Reset link has expired.", 400);
  }

  if (verification.consumedAt) {
    throw new AppError("Reset link has already been used.", 400);
  }

  const user = await UserRepository.findByIdWithPassword(input.userId);

  if (!user) {
    throw new AppError("User not found.", 404);
  }

  const passwordHash = await hashPassword(input.password);

  await UserRepository.updatePassword(
    input.userId,
    passwordHash,
  );

  await VerificationRepo.markConsumed(verification._id.toString());

  await SessionRepository.revokeAllUserSessions(
    input.userId,
  );

  return {
    message: "Password reset successfully. Please sign in again.",
  };
};


export const requestPasswordChangeOtpService = async (userId: string) => {
  if (!Types.ObjectId.isValid(userId)) {
    throw new AppError("Invalid userId", 400);
  }

  const user = await UserRepository.findById(userId);
  if (!user) {
    throw new AppError("User not found", 404);
  }

  const { challenge, otp } = await createOtpChallenge({
    userId: user._id,
    purpose: OtpPurpose.RESET_PASSWORD,
    email: user.email,
  });

  await sendOtpChallengeMail({
    email: user.email,
    otp,
    purpose: OtpPurpose.RESET_PASSWORD
  });

  return {
    challengeId: challenge._id.toString(),
    maskedEmail: maskEmail(user.email),
    message: `We sent a verification code to ${maskEmail(user.email)}.`,
  };
};

export const confirmPasswordChangeOtpService = async (input: { userId: string; challengeId: string; otp: string; newPassword: string; }) => {
  if (!Types.ObjectId.isValid(input.userId)) {
    throw new AppError("Invalid userId", 400);
  }

  if (input.newPassword.trim().length < 6) {
    throw new AppError("Password must be at least 6 characters", 400);
  }

  const challenge = await consumeOtpChallenge({
    challengeId: input.challengeId,
    otp: input.otp,
    purpose: OtpPurpose.RESET_PASSWORD,
  });

  if (challenge.userId?.toString() !== input.userId) {
    throw new AppError("OTP challenge does not belong to this user", 403);
  }

  const user = await UserRepository.findByIdWithPassword(input.userId);
  if (!user) {
    throw new AppError("User not found", 404);
  }

  user.password = await hashPassword(input.newPassword);
  await user.save();

  return {
    message: "Password updated successfully.",
    user: await serializeUser(user),
  };
};

export const confirmEmailVerificationService = async (input: { userId: string, token: string }) => {
  if (!Types.ObjectId.isValid(input.userId)) {
    throw new AppError("Invalid userId", 400);
  }

  const verification = await VerificationRepo.findActiveByToken({
    userId: input.userId,
    purpose: VerificationPurpose.EMAIL_VERIFICATION,
    codeHash: sha256(input.token),
  });

  if (!verification || verification.expiresAt.getTime() <= Date.now()) {
    throw new AppError("Verification token is invalid or expired", 400);
  }

  verification.consumedAt = new Date();
  await verification.save();

  const user = await UserRepository.findById(input.userId);

  if (!user) {
    throw new AppError("User not found", 404);
  }

  user.emailVerifiedAt = new Date();
  await user.save();

  return {
    user: await serializeUser(user),
  };
};

export const authMeService = async (accessToken: string) => {
  const decoded = verifyAccessToken(accessToken);
  const user = await UserRepository.findById(decoded.userId);

  if (!user || !user.status) {
    throw new AppError("Unauthorized", 401);
  }

  return await serializeUser(user);
};

export const refreshSessionService = async (refreshToken: string) => {
  const decoded = verifyRefreshToken(refreshToken);

  const session = await SessionRepository.findById(decoded.sessionId);
  if (!session || session.revokedAt || session.jti !== decoded.jti) {
    throw new AppError("Session expired", 401);
  }
  if (session.refreshTokenHash !== sha256(refreshToken)) {
    session.revokedAt = new Date();
    await session.save();
    throw new AppError("Session invalidated", 401);
  }
  if (session.expiresAt.getTime() <= Date.now()) {
    session.revokedAt = new Date();
    await session.save();
    throw new AppError("Session expired", 401);
  }

  const user = await UserRepository.findById(decoded.userId);
  if (!user ||!user.status || user.deletedAt) {
    throw new AppError("User not found", 401);
  }

  const nextJti = randomUUID();
  const nextRefreshToken = signRefreshToken({
    userId: decoded.userId,
    sessionId: decoded.sessionId,
    jti: nextJti,
  });

  session.jti = nextJti;
  session.refreshTokenHash = sha256(nextRefreshToken);
  session.rotatedAt = new Date();
  await session.save();

  return {
    accessToken: signAccessToken(buildAccessPayload(user, session._id.toString())),
    refreshToken: nextRefreshToken,
    user: await serializeUser(user),
  };
};

export const logoutService = async (token: string, isRefreshToken = false) => {
  const decoded = isRefreshToken ? verifyRefreshToken(token) : verifyAccessToken(token);
  await SessionRepository.revoke(decoded.sessionId);
  return { message: "Logged out successfully" };
};


