import type { NextFunction, Request, RequestHandler, Response } from "express";
import { ENV } from "../config/envConfig.js";
import { AppError } from "../utils/appError.js";

type RateLimitEntry = {
  count: number;
  resetAt: number;
};

const requestCounts = new Map<string, RateLimitEntry>();

const sanitizeValue = (value: unknown): unknown => {
  if (Array.isArray(value)) return value.map(sanitizeValue);

  if (value && typeof value === "object") {
    const sanitized: Record<string, unknown> = {};
    for (const [key, nestedValue] of Object.entries(value)) {
      if (key.startsWith("$") || key.includes(".")) continue;
      sanitized[key] = sanitizeValue(nestedValue);
    }
    return sanitized;
  }

  return value;
};

export const securityHeaders: RequestHandler = (_req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  res.setHeader("Permissions-Policy", "camera=(self), microphone=(self), geolocation=()");
  res.setHeader("Cross-Origin-Resource-Policy", "same-site");
  if (ENV.NODE_ENV === "production") {
    res.setHeader("Strict-Transport-Security", "max-age=15552000; includeSubDomains");
  }
  next();
};

export const corsMiddleware: RequestHandler = (req, res, next) => {
  const requestOrigin = req.headers.origin;
  const allowedOrigin = requestOrigin && ENV.CORS_ORIGINS.includes(requestOrigin)
    ? requestOrigin
    : ENV.CORS_ORIGINS[0] ?? "*";

  res.setHeader("Vary", "Origin");
  res.setHeader("Access-Control-Allow-Origin", allowedOrigin);
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PATCH,PUT,DELETE,OPTIONS");

  if (req.method === "OPTIONS") {
    res.sendStatus(204);
    return;
  }

  next();
};

export const sanitizeMongoQueries: RequestHandler = (req, _res, next) => {
  req.body = sanitizeValue(req.body);
  req.query = sanitizeValue(req.query) as typeof req.query;
  req.params = sanitizeValue(req.params) as typeof req.params;
  next();
};

export const rateLimit =
  (options: { windowMs: number; max: number; keyPrefix?: string }): RequestHandler =>
  (req: Request, _res: Response, next: NextFunction) => {
    const now = Date.now();
    const key = `${options.keyPrefix ?? "global"}:${req.ip ?? "unknown"}`;
    const entry = requestCounts.get(key);

    if (!entry || entry.resetAt <= now) {
      requestCounts.set(key, { count: 1, resetAt: now + options.windowMs });
      next();
      return;
    }

    entry.count += 1;
    if (entry.count > options.max) {
      next(new AppError("Too many requests. Please try again later.", 429));
      return;
    }

    next();
  };
