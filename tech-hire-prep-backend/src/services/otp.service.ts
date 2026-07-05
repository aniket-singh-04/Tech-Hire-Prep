import { randomInt } from "crypto";
import { ENV } from "../config/envConfig.ts";
import { Purpose, UserRole } from "../types/user.types.ts";
import { sha256 } from "../utils/security.ts";
import { OtpRepository } from "../repositories/otp.repository.ts";
import { AppError } from "../utils/appError.ts";

export function generateOtp() {
  return randomInt(0, 1000000)
    .toString()
    .padStart(6, "0");
}

export function getOtpExpiryDate() {
  return new Date(
    Date.now() + ENV.OTP_TTL_MINUTES * 60 * 1000,
  );
}

export async function createRegisterOtp(data: { name: string; email: string; passwordHash: string; role: UserRole; }) {
  const otp = generateOtp();
  console.log(otp)
  await OtpRepository.deleteActiveOtp(
    data.email,
    Purpose.REGISTER,
  );

  const challenge = await OtpRepository.create({
    purpose: Purpose.REGISTER,
    email: data.email,
    codeHash: sha256(otp),
    expiresAt: getOtpExpiryDate(),
    pendingUser: {
      name: data.name,
      email: data.email,
      passwordHash: data.passwordHash,
      role: data.role,
    },
  });

  return {
    otp,
    challenge,
  };
}

export const consumeOtpChallenge = async (input: {
  challengeId: string;
  otp: string;
  purpose: "REGISTER" | "LOGIN" | "PASSWORD_CHANGE";
}) => {
  const challenge = await OtpRepository.findById(input.challengeId);

  if (!challenge || challenge.purpose !== input.purpose) {
    throw new AppError("OTP challenge not found", 404);
  }

  if (challenge.consumedAt) throw new AppError("OTP already used", 400);

  if (challenge.expiresAt.getTime() <= Date.now()) {
    throw new AppError("OTP has expired", 400);
  }

  if ((challenge.attempts ?? 0) >= (challenge.maxAttempts ?? 5)) {
    throw new AppError("Too many invalid OTP attempts. Request a new code.", 429);
  }

  challenge.attempts = (challenge.attempts ?? 0) + 1;

  if (challenge.codeHash !== sha256(input.otp.trim())) {
    await challenge.save();
    throw new AppError("Invalid OTP", 400);
  }

  challenge.consumedAt = new Date();
  await challenge.save();

  return challenge;
};

