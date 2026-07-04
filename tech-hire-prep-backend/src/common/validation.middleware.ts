import type { NextFunction, Request, Response } from "express";
import rateLimit from "express-rate-limit";
import type { ZodType } from "zod";


export const validateBody = (schema: ZodType<unknown>) =>
  (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse({
      body: req.body,
      params: req.params,
      query: req.query,
    });

    if (!result.success) {
      const fieldErrors = result.error.issues
        .filter((issue) => issue.path.length > 0)
        .map((issue) => ({
          field: issue.path.join("."),
          message: issue.message,
        }));

      const formErrors = result.error.issues
        .filter((issue) => issue.path.length === 0)
        .map((issue) => issue.message);

      return res.status(400).json({
        success: false,
        requestId: req.requestId,
        message:
          formErrors[0] ??
          fieldErrors[0]?.message ??
          "Validation failed.",
        details: {
          formErrors,
          fieldErrors,
        },
      });
    }

    const parsedRequest = result.data as {
      body?: unknown;
      params?: unknown;
      query?: unknown;
    };

    if (parsedRequest.body !== undefined) {
      req.body = parsedRequest.body as typeof req.body;
    }

    if (parsedRequest.params !== undefined) {
      req.params = parsedRequest.params as typeof req.params;
    }

    if (parsedRequest.query !== undefined) {
      req.query = parsedRequest.query as typeof req.query;
    }

    next();
  };








export const authStartLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 8,
  standardHeaders: true,
  legacyHeaders: false,
});

export const authOtpLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
});

export const passwordResetLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 6,
  standardHeaders: true,
  legacyHeaders: false,
});
