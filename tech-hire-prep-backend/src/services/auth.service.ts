import { User, type UserDocument } from "../models/user.model.js";
import { AppError } from "../utils/appError.js";
import type { LoginInput, RegisterInput } from "../modules/auth/auth.schemas.js";
import { hashPassword, verifyPassword } from "../modules/auth/password.js";
import {
  createAccessToken,
  createRefreshToken,
  hashRefreshToken,
  refreshTokenExpiry,
} from "../modules/auth/token.service.js";

const publicUser = (user: UserDocument) => ({
  id: user._id.toString(),
  email: user.email,
  name: user.name,
  role: user.role,
  isEmailVerified: user.isEmailVerified,
});

const issueSession = async (user: UserDocument) => {
  const accessToken = createAccessToken({ userId: user._id.toString(), role: user.role });
  const refreshToken = createRefreshToken();

  user.refreshTokens = [
    ...user.refreshTokens.filter((token) => !token.revokedAt && token.expiresAt > new Date()),
    {
      tokenHash: hashRefreshToken(refreshToken),
      expiresAt: refreshTokenExpiry(),
      createdAt: new Date(),
    },
  ];

  await user.save();

  return {
    user: publicUser(user),
    accessToken,
    refreshToken,
  };
};

export const registerService = async (payload: RegisterInput) => {
  const existingUser = await User.findOne({ email: payload.email }).lean();
  if (existingUser) {
    throw new AppError("Email already exists.", 409);
  }

  const user = await User.create({
    email: payload.email,
    name: payload.name,
    passwordHash: await hashPassword(payload.password),
    role: "student",
    isEmailVerified: false,
    refreshTokens: [],
  });

  return issueSession(user);
};

export const loginService = async (payload: LoginInput) => {
  const user = await User.findOne({ email: payload.email }).select("+passwordHash +refreshTokens");
  if (!user || !(await verifyPassword(payload.password, user.passwordHash))) {
    throw new AppError("Invalid email or password.", 401);
  }

  return issueSession(user);
};

export const refreshService = async (refreshToken: string | undefined) => {
  if (!refreshToken) {
    throw new AppError("Refresh token is required.", 401);
  }

  const tokenHash = hashRefreshToken(refreshToken);
  const user = await User.findOne({ "refreshTokens.tokenHash": tokenHash }).select("+refreshTokens");
  const storedToken = user?.refreshTokens.find((token) => token.tokenHash === tokenHash);

  if (!user || !storedToken || storedToken.revokedAt || storedToken.expiresAt <= new Date()) {
    throw new AppError("Invalid refresh token.", 401);
  }

  storedToken.revokedAt = new Date();
  storedToken.rotatedAt = new Date();

  return issueSession(user);
};

export const logoutService = async (refreshToken: string | undefined) => {
  if (!refreshToken) return;

  const tokenHash = hashRefreshToken(refreshToken);
  await User.updateOne(
    { "refreshTokens.tokenHash": tokenHash },
    { $set: { "refreshTokens.$.revokedAt": new Date() } },
  );
};
