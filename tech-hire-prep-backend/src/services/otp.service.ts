import { randomInt } from "crypto";
import { ENV } from "../config/envConfig.ts";
import { Purpose, UserRole } from "../types/user.types.ts";
import { sha256 } from "../utils/security.ts";
import { OtpRepository } from "../repositories/otp.repository.ts";

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

export async function createRegisterOtp(data: {
  name: string;
  email: string;
  passwordHash: string;
  role: UserRole;
}) {
  const otp = generateOtp();

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