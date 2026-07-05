import { Types } from "mongoose";
import { UserRole } from "../types/user.types.ts";
import { randomUUID } from "node:crypto";
import { ENV } from "../config/envConfig.ts";
import { signAccessToken, signRefreshToken } from "./token.service.ts";
import { sha256 } from "../utils/security.ts";
import { AccessTokenPayload } from "../types/token.types.ts";
import { Request } from "express";
import { SessionRepository } from "../repositories/session.repository.ts";


export const buildAccessPayload = (user: { _id: Types.ObjectId; role?: UserRole }, sessionId: string): AccessTokenPayload => ({
  userId: user._id.toString(),
  sessionId,
  role: user.role ?? UserRole.STUDENT,
});

const getExpiryDate = (days: number) => new Date(Date.now() + days * 24 * 60 * 60 * 1000);

export const createSession = async (req: Request, user: { _id: Types.ObjectId; role?: UserRole }) => {
  const jti = randomUUID();
  const expiresAt = getExpiryDate(ENV.REFRESH_TOKEN_TTL_DAYS);


  const session = await SessionRepository.create({
    userId: user._id,
    refreshTokenHash: "pending",
    jti,
    expiresAt,
    userAgentHash: req.headers["user-agent"] ? sha256(String(req.headers["user-agent"])) : undefined,
    ipHash: req.ip ? sha256(req.ip) : undefined,
  });

  const refreshToken = signRefreshToken({
    userId: user._id.toString(),
    sessionId: session._id.toString(),
    jti,
  });

  session.refreshTokenHash = sha256(refreshToken);
  await session.save();

  const accessToken = signAccessToken(
    buildAccessPayload(user, session._id.toString())
  );

  return {
    sessionId: session._id.toString(),
    accessToken,
    refreshToken,
  };
};