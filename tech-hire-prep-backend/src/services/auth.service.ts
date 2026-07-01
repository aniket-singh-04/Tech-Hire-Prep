import { User, type UserDocument } from "../models/user.model.js";
import { writeAuditLog } from "./audit.service.js";
import { AppError } from "../utils/appError.js";
import type { LoginInput, RegisterInput } from "../modules/auth/auth.schemas.js";
import { hashPassword, verifyPassword } from "../modules/auth/password.js";
import { createAccessToken, createRefreshToken, hashRefreshToken, refreshTokenExpiry } from "../modules/auth/token.service.js";

const publicUser = (user: UserDocument) => ({
  id: user._id.toString(),
  email: user.email,
  name: user.name,
  role: user.role,
  status: user.status,
  avatarUrl: user.avatarUrl,
  isEmailVerified: user.isEmailVerified,
});

const issueSession = async (user: UserDocument, auditContext?: { requestId?: string; ipAddress?: string }) => {
  const accessToken = createAccessToken({ userId: user._id.toString(), role: user.role });
  const refreshToken = createRefreshToken();

  user.refreshTokens = [
    ...user.refreshTokens.filter((token) => !token.revokedAt && token.expiresAt > new Date()),
    { tokenHash: hashRefreshToken(refreshToken), expiresAt: refreshTokenExpiry(), createdAt: new Date() },
  ];
  user.lastLoginAt = new Date();
  await user.save();

  if (auditContext) {
    await writeAuditLog({ actorUserId: user._id.toString(), action: "auth.session_issued", targetType: "user", targetId: user._id.toString(), requestId: auditContext.requestId, ipAddress: auditContext.ipAddress });
  }

  return { user: publicUser(user), accessToken, refreshToken };
};

export const registerService = async (payload: RegisterInput, auditContext?: { requestId?: string; ipAddress?: string }) => {
  const existingUser = await User.findOne({ email: payload.email }).lean();
  if (existingUser) throw new AppError("Email already exists.", 409);

  const user = await User.create({
    email: payload.email,
    name: payload.name,
    passwordHash: await hashPassword(payload.password),
    role: "student",
    status: "active",
    isEmailVerified: false,
    refreshTokens: [],
  });

  await writeAuditLog({ actorUserId: user._id.toString(), action: "auth.register", targetType: "user", targetId: user._id.toString(), requestId: auditContext?.requestId, ipAddress: auditContext?.ipAddress });
  return issueSession(user, auditContext);
};

export const loginService = async (payload: LoginInput, auditContext?: { requestId?: string; ipAddress?: string }) => {
  const user = await User.findOne({ email: payload.email }).select("+passwordHash +refreshTokens");
  if (!user || user.status !== "active" || !(await verifyPassword(payload.password, user.passwordHash))) {
    throw new AppError("Invalid email or password.", 401);
  }

  await writeAuditLog({ actorUserId: user._id.toString(), action: "auth.login", targetType: "user", targetId: user._id.toString(), requestId: auditContext?.requestId, ipAddress: auditContext?.ipAddress });
  return issueSession(user, auditContext);
};

export const refreshService = async (refreshToken: string | undefined, auditContext?: { requestId?: string; ipAddress?: string }) => {
  if (!refreshToken) throw new AppError("Refresh token is required.", 401);

  const tokenHash = hashRefreshToken(refreshToken);
  const user = await User.findOne({ "refreshTokens.tokenHash": tokenHash }).select("+refreshTokens");
  const storedToken = user?.refreshTokens.find((token) => token.tokenHash === tokenHash);

  if (!user || !storedToken || storedToken.revokedAt || storedToken.expiresAt <= new Date()) {
    throw new AppError("Invalid refresh token.", 401);
  }

  storedToken.revokedAt = new Date();
  storedToken.rotatedAt = new Date();
  await writeAuditLog({ actorUserId: user._id.toString(), action: "auth.refresh", targetType: "user", targetId: user._id.toString(), requestId: auditContext?.requestId, ipAddress: auditContext?.ipAddress });

  return issueSession(user, auditContext);
};

export const logoutService = async (refreshToken: string | undefined, auditContext?: { requestId?: string; ipAddress?: string; actorUserId?: string }) => {
  if (!refreshToken) return;

  const tokenHash = hashRefreshToken(refreshToken);
  const updated = await User.findOneAndUpdate(
    { "refreshTokens.tokenHash": tokenHash },
    { $set: { "refreshTokens.$.revokedAt": new Date() } },
    { new: true },
  ).select("_id");

  await writeAuditLog({ actorUserId: auditContext?.actorUserId ?? updated?._id?.toString(), action: "auth.logout", targetType: "user", targetId: updated?._id?.toString(), requestId: auditContext?.requestId, ipAddress: auditContext?.ipAddress });
};
