import type { NextFunction, Request, Response } from "express";
import { AppError } from "../utils/appError.js";

const normalizeDuplicateField = (field: string) => {
  const normalizedField = field.toLowerCase();
  if (normalizedField === "email") return "Email already exists.";
  return `${normalizedField} already exists.`;
};

const sendError = (res: Response, req: Request, statusCode: number, message: string, details?: unknown) =>
  res.status(statusCode).json({
    success: false,
    message,
    ...(details !== undefined ? { details } : {}),
    requestId: req.requestId,
  });

export const globalErrorHandler = (err: Error, req: Request, res: Response, _next: NextFunction) => {
  if (err instanceof AppError) {
    return sendError(res, req, err.statusCode, err.message, err.details);
  }

  const maybeMongoError = err as Error & {
    code?: number;
    keyPattern?: Record<string, number>;
    keyValue?: Record<string, unknown>;
    errors?: Record<string, { message?: string }>;
    path?: string;
    issues?: Array<{ path?: Array<string | number>; message?: string }>;
  };

  if (maybeMongoError.code === 11000) {
    const field = Object.keys(maybeMongoError.keyPattern ?? maybeMongoError.keyValue ?? {})[0] ?? "field";
    return sendError(res, req, 409, normalizeDuplicateField(field));
  }

  if (err.name === "ValidationError" && maybeMongoError.errors) {
    const firstMessage = Object.values(maybeMongoError.errors)[0]?.message;
    return sendError(res, req, 400, firstMessage ?? "Validation failed.");
  }

  if (err.name === "CastError" && maybeMongoError.path) {
    return sendError(res, req, 400, `Invalid ${maybeMongoError.path}.`);
  }

  if (err.name === "ZodError" && maybeMongoError.issues?.length) {
    const fieldErrors = maybeMongoError.issues.map((issue) => ({
      field: issue.path?.join(".") ?? "body",
      message: issue.message ?? "Validation failed.",
    }));
    return sendError(res, req, 400, fieldErrors[0]?.message ?? "Validation failed.", { fieldErrors });
  }

  console.error(`[${req.requestId ?? "n/a"}]`, err);
  return sendError(res, req, 500, "Something went wrong on our side. Please try again.");
};
