
/* -------------------------------------------------------------------------- */
/*                               JWT PAYLOADS                                 */
/* -------------------------------------------------------------------------- */

import { UserRole } from "./user.types.ts";

export interface JwtAccessPayload {
  userId: string;
  sessionId: string;
  role: UserRole;
}

export interface JwtRefreshPayload {
  userId: string;
  sessionId: string;
  jti: string;
}

/* -------------------------------------------------------------------------- */
/*                              AUTH REQUESTS                                 */
/* -------------------------------------------------------------------------- */

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  role?: UserRole;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface VerifyOtpRequest {
  challengeId: string;
  otp: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  password: string;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

/* -------------------------------------------------------------------------- */
/*                               OTP TYPES                                    */
/* -------------------------------------------------------------------------- */

export interface OtpChallengeResult {
  challengeId: string;
  email: string;
  otp: string;
  expiresAt: Date;
}

export interface VerifiedOtpResult {
  challengeId: string;
  userId?: string;
  pendingUser?: Record<string, unknown>;
}

/* -------------------------------------------------------------------------- */
/*                             SESSION TYPES                                  */
/* -------------------------------------------------------------------------- */

export interface SessionPair {
  accessToken: string;
  refreshToken: string;
}

export interface SessionMetadata {
  ipAddress?: string | null;
  userAgent?: string | null;
}

/* -------------------------------------------------------------------------- */
/*                          EMAIL VERIFICATION                                */
/* -------------------------------------------------------------------------- */

export interface EmailVerificationResult {
  verificationToken: string;
  expiresAt: Date;
}

/* -------------------------------------------------------------------------- */
/*                              AUTH RESPONSE                                 */
/* -------------------------------------------------------------------------- */

export interface AuthResponse<T = unknown> {
  success: boolean;
  message: string;
  data: T;
}