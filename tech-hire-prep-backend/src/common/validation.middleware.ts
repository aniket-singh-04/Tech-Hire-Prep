import type { RequestHandler } from "express";
import type { z } from "zod";

const validate = <TSchema extends z.ZodType>(schema: TSchema, value: unknown) => schema.parse(value);

export const validateBody = <TSchema extends z.ZodType>(schema: TSchema): RequestHandler =>
  (req, _res, next) => {
    req.body = validate(schema, req.body);
    next();
  };

export const validateQuery = <TSchema extends z.ZodType>(schema: TSchema): RequestHandler =>
  (req, _res, next) => {
    req.query = validate(schema, req.query) as typeof req.query;
    next();
  };

export const validateParams = <TSchema extends z.ZodType>(schema: TSchema): RequestHandler =>
  (req, _res, next) => {
    req.params = validate(schema, req.params) as typeof req.params;
    next();
  };
