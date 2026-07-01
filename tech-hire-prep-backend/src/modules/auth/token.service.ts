import { createHmac, randomBytes, timingSafeEqual } from "crypto";
import { ENV } from "../../config/envConfig.js";
import type { UserRole } from "../../models/user.model.js";

type AccessTokenPayload = {
  sub: string;
  role: UserRole;
  type: "access";
  exp: number;
  iat: number;
};

const encode = (value: unknown): string =>
  Buffer.from(JSON.stringify(value)).toString("base64url");

const sign = (data: string, secret: string): string =>
  createHmac("sha256", secret).update(data).digest("base64url");

export const createAccessToken = (payload: { userId: string; role: UserRole }): string => {
  const header = encode({ alg: "HS256", typ: "JWT" });
  const now = Math.floor(Date.now() / 1000);
  const body = encode({
    sub: payload.userId,
    role: payload.role,
    type: "access",
    iat: now,
    exp: now + ENV.ACCESS_TOKEN_TTL_SECONDS,
  } satisfies AccessTokenPayload);
  const unsigned = `${header}.${body}`;
  return `${unsigned}.${sign(unsigned, ENV.ACCESS_TOKEN_SECRET)}`;
};

export const verifyAccessToken = (token: string): AccessTokenPayload => {
  const [header, body, signature] = token.split(".");
  if (!header || !body || !signature) {
    throw new Error("Invalid token");
  }

  const expected = sign(`${header}.${body}`, ENV.ACCESS_TOKEN_SECRET);
  const expectedBuffer = Buffer.from(expected);
  const signatureBuffer = Buffer.from(signature);
  if (
    expectedBuffer.length !== signatureBuffer.length ||
    !timingSafeEqual(expectedBuffer, signatureBuffer)
  ) {
    throw new Error("Invalid token");
  }

  const payload = JSON.parse(Buffer.from(body, "base64url").toString()) as AccessTokenPayload;
  if (payload.type !== "access" || payload.exp <= Math.floor(Date.now() / 1000)) {
    throw new Error("Invalid token");
  }

  return payload;
};

export const createRefreshToken = (): string => randomBytes(48).toString("base64url");

export const hashRefreshToken = (token: string): string =>
  createHmac("sha256", ENV.REFRESH_TOKEN_SECRET).update(token).digest("base64url");

export const refreshTokenExpiry = (): Date =>
  new Date(Date.now() + ENV.REFRESH_TOKEN_TTL_DAYS * 24 * 60 * 60 * 1000);
