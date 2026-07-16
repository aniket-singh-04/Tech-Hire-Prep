import type { NextFunction, Request, Response } from "express";
import rateLimit from "express-rate-limit";
import { z, type ZodType } from "zod";


export const validateBody = (schema: ZodType) =>
  (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      const fieldErrors = result.error.issues.map((issue) => ({
        field: issue.path.join("."),
        message: issue.message,
      }));

      return res.status(400).json({
        success: false,
        requestId: req.requestId,
        message: fieldErrors[0]?.message ?? "Validation failed.",
        details: {
          fieldErrors,
        },
      });
    }

    req.body = result.data as typeof req.body;

    next();
  };

export const validateParams = (schema: ZodType) =>
  (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.params);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: "Invalid route parameters.",
        details: z.treeifyError(result.error),
      });
    }

    req.params = result.data as typeof req.params;

    next();
  };

export const validateQuery = (schema: ZodType) =>
  (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.query);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: "Invalid query parameters.",
        details: z.treeifyError(result.error),
      });
    }

    Object.assign(req.query as Record<string, unknown>, result.data as Record<string, unknown>);

    next();
  };




export const authStartLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 80,
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


