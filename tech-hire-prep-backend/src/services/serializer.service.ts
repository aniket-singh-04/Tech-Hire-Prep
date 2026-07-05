import { Types } from "mongoose";
import { UserRole, UserStatus } from "../types/user.types.ts";

export const serializeUser = async (user: {
  _id: Types.ObjectId;
  name: string;
  email: string;
  role: UserRole;
  avatar?: { s3Key?: string };
  emailVerifiedAt?: Date | null;
  status?: UserStatus;
}) => ({
  id: user._id.toString(),
  _id: user._id.toString(),
  name: user.name,
  email: user.email,
  role: user.role,
  // imageUrl: await getScopedAvatarUrl(user._id.toString(), user.avatar?.s3Key),
  emailVerifiedAt: user.emailVerifiedAt ?? null,
  status: user.status ?? UserStatus.ACTIVE,
});