import { UserRole } from "./user.types.ts";

export type AccessTokenPayload = {
  userId: string;
  sessionId: string;
  role: UserRole;
};