import express, { type Application, type NextFunction, type Request, type Response } from "express";
import { randomUUID } from "crypto";
import { getAppRuntime } from "./config/runtime.js";
import { globalErrorHandler } from "./middlewares/error.middleware.js";
import {
  corsMiddleware,
  rateLimit,
  sanitizeMongoQueries,
  securityHeaders,
} from "./middlewares/security.middleware.js";
import authRoute from "./routes/auth.routes.js";
import { AppError } from "./utils/appError.js";

export const API_V1_PREFIX = "/api/v1";

export const createApp = (): Application => {
  const app: Application = express();

  app.disable("x-powered-by");
  app.set("trust proxy", 1);
  app.use(securityHeaders);
  app.use(corsMiddleware);
  app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 300, keyPrefix: "api" }));
  app.use(express.json({ limit: "1mb" }));
  app.use(express.urlencoded({ extended: true, limit: "1mb" }));
  app.use(sanitizeMongoQueries);

  app.use((req: Request, _res: Response, next: NextFunction) => {
    req.requestId = randomUUID();
    next();
  });

  app.get(`${API_V1_PREFIX}/health`, (_req, res) => {
    res.status(200).json({
      status: "OK",
      version: "v1",
      runtime: getAppRuntime(),
      uptime: process.uptime(),
    });
  });

  app.use(`${API_V1_PREFIX}/auth`, authRoute);

  app.use((_req, _res, next) => {
    next(new AppError("Route not found.", 404));
  });

  app.use(globalErrorHandler);
  return app;
};

const app = createApp();

export default app;
