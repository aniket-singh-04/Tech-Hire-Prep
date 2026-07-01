import type { Request, Response } from "express";
import { ENV } from "../config/envConfig.js";

export const REFRESH_COOKIE_NAME = "refreshToken";

const buildCookieOptions = (maxAgeSeconds: number) => [
  "HttpOnly",
  "Path=/",
  "SameSite=Strict",
  `Max-Age=${maxAgeSeconds}`,
  ...(ENV.NODE_ENV === "production" ? ["Secure"] : []),
].join("; ");

export const setRefreshCookie = (res: Response, token: string) => {
  res.setHeader(
    "Set-Cookie",
    `${REFRESH_COOKIE_NAME}=${encodeURIComponent(token)}; ${buildCookieOptions(ENV.REFRESH_TOKEN_TTL_DAYS * 24 * 60 * 60)}`,
  );
};

export const clearRefreshCookie = (res: Response) => {
  res.setHeader("Set-Cookie", `${REFRESH_COOKIE_NAME}=; ${buildCookieOptions(0)}`);
};

export const getCookie = (req: Request, name: string): string | undefined => {
  const header = req.headers.cookie;
  if (!header) return undefined;

  const cookies = header.split(";").map((part) => part.trim());
  const match = cookies.find((part) => part.startsWith(`${name}=`));
  return match ? decodeURIComponent(match.slice(name.length + 1)) : undefined;
};
