import { Types } from "mongoose";
import { TokenPurpose } from "../types/token.types.ts";

export interface IEmailVerificationToken {
  userId: Types.ObjectId;
  tokenHash: string;
  expiresAt: Date;
  consumedAt?: Date | null;

  purpose: TokenPurpose;

  resendCount: number;
}