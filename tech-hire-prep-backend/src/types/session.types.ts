import { Types } from "mongoose";

export enum SessionRevokeReason {
  LOGOUT = "LOGOUT",
  PASSWORD_RESET = "PASSWORD_RESET",
  ADMIN = "ADMIN",
  TOKEN_REUSE = "TOKEN_REUSE",
}




export interface ISession  {
  userId: Types.ObjectId;

  refreshTokenHash: string;

  jti: string;

  userAgentHash: string | null;

  ipHash: string | null;

  lastUsedAt: Date;

  expiresAt: Date;

  rotatedAt: Date | null;

  revokedAt: Date | null;

  revokeReason: SessionRevokeReason | null;

  createdAt: Date;

  updatedAt: Date;
}