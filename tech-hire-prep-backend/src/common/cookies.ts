import type { Request, Response } from "express";
import { ENV } from "../config/envConfig.js";

export const REFRESH_COOKIE_NAME = "refreshToken";

const cookieOptions = [
  "HttpOnly",
  "Path=/",
  "SameSite=Strict",
  `Max-Age=${ENV.REFRESH_TOKEN_TTL_DAYS * 24 * 60 * 60}`,
  ...(ENV.NODE_ENV === "production" ? ["Secure"] : []),
].join("; ");

export const setRefreshCookie = (res: Response, token: string) => {
  res.setHeader("Set-Cookie", `${REFRESH_COOKIE_NAME}=${token}; ${cookieOptions}`);
};

export const clearRefreshCookie = (res: Response) => {
  res.setHeader(
    "Set-Cookie",
    `${REFRESH_COOKIE_NAME}=; HttpOnly; Path=/; SameSite=Strict; Max-Age=0${
      ENV.NODE_ENV === "production" ? "; Secure" : ""
    }`,
  );
};

export const getCookie = (req: Request, name: string): string | undefined => {
  const header = req.headers.cookie;
  if (!header) return undefined;

  const cookies = header.split(";").map((part) => part.trim());
  const match = cookies.find((part) => part.startsWith(`${name}=`));
  if (!match) return undefined;

  return decodeURIComponent(match.slice(name.length + 1));
};
