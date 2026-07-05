import { randomInt } from "crypto";
import { ENV } from "../config/envConfig.ts";
import { Purpose, UserRole } from "../types/user.types.ts";
import { sha256 } from "../utils/security.ts";
import { OtpRepository } from "../repositories/otp.repository.ts";
import { AppError } from "../utils/appError.ts";
import { Types } from "mongoose";
import { CreateOtpChallengeInput } from "../types/otpchallange.type.ts";

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


export const createOtpChallenge = async (
  input: CreateOtpChallengeInput,
) => {
  const otp = generateOtp();
  console.log(otp);

  await OtpRepository.deleteActiveOtp(
    input.email,
    input.purpose,
  );

 
  const challenge = await OtpRepository.create({
    ...(input.userId && { userId: input.userId }),

    purpose: input.purpose,
    email: input.email,

    codeHash: sha256(otp),
    expiresAt: getOtpExpiryDate(),

    ...(input.pendingUser && {
      pendingUser: input.pendingUser,
    }),

    metadata: input.metadata ?? {},
  });

  return {
    otp,
    challenge,
  };
}


export const consumeOtpChallenge = async (input: {
  challengeId: string;
  otp: string;
  purpose: Purpose;
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

