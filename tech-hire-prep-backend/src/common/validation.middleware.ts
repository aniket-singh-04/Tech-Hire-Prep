import type { RequestHandler } from "express";
import type { z } from "zod";

export const validateBody =
  <TSchema extends z.ZodType>(schema: TSchema): RequestHandler =>
  (req, _res, next) => {
    const parsed = schema.parse(req.body);
    req.body = parsed;
    next();
  };
