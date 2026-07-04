import type { NextFunction, Request, RequestHandler, Response } from "express";

export interface AppRequestHandler extends RequestHandler {}

export type AsyncRouteHandler = (
  req: Request,
  res: Response,
  next: NextFunction,
) => Promise<unknown> | unknown;

export const asyncHandler = (fn: AsyncRouteHandler): AppRequestHandler =>
  (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
