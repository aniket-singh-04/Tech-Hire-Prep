import { UserRole } from "./user.types.ts";

export enum TokenPurpose {
  EMAIL_VERIFICATION = "EMAIL_VERIFICATION",
  ACCOUNT_UPDATE = "ACCOUNT_UPDATE",
  PASSWORD_RESET = "PASSWORD_RESET",
}

export type AccessTokenPayload = {
  userId: string;
  sessionId: string;
  role: UserRole;
};