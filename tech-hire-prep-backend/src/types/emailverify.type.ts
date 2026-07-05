import { Types } from "mongoose";


export interface IEmailVerificationToken {
  userId: Types.ObjectId;
  tokenHash: string;
  expiresAt: Date;
  consumedAt?: Date | null;

  purpose: VerificationPurpose;

  resendCount: number;
}

export enum VerificationPurpose {
  EMAIL_VERIFICATION = "EMAIL_VERIFICATION",
  FORGOT_PASSWORD = "FORGOT_PASSWORD",
}
