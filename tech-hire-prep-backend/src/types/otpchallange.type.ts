import { Types } from "mongoose";
import { Purpose, UserRole } from "./user.types.ts";

export interface IOtpChallenge {
  userId?: Types.ObjectId | null;
  purpose: Purpose;
  email: string;
  codeHash: string;
  expiresAt: Date;
  consumedAt?: Date | null;
  attempts: number;
  maxAttempts: number;
  resendCount: number;

  pendingUser?: {
    name: string;
    email: string;
    phone?: string;
    passwordHash: string;
    role: UserRole;
    gstNumber?: string;
  } | null;

  ipHash?: string | null;
  userAgentHash?: string | null;
  metadata: Map<string, unknown>;
}


export interface CreateOtpChallengeInput {
  purpose: Purpose;
  email: string;
  userId?: Types.ObjectId;

  pendingUser?: {
    name: string;
    email: string;
    passwordHash: string;
    role: UserRole;
  };

  metadata?: Record<string, unknown>;
}