import express, { type Application, type NextFunction, type Request, type Response } from "express";
import cookieParser from "cookie-parser";
import { AppError } from "./utils/appError.ts";
import { ENV } from "./config/envConfig.ts";
import authRoute from "./routes/auth.routes.ts";
import { globalErrorHandler } from "./middlewares/error.middleware.ts";
import rateLimit from "express-rate-limit";
import hpp from "hpp";
import helmet from "helmet";
import cors from "cors";
import userRoute from "./routes/user.routes.ts";
export const API_V1_PREFIX = "/api/v1";


const corsOptions = {
  origin(origin: string | undefined, callback: (error: Error | null, allow?: boolean) => void) {
    if (!origin) {
      callback(null, true);
      return;
    }

    const allowedOrigins = ENV.CORS_ORIGINS;
    callback(null, allowedOrigins.includes(origin));
  },
  credentials: true,
  methods: ["GET", "HEAD", "PUT", "PATCH", "POST", "DELETE", "OPTIONS"],
  allowedHeaders: [
    "Content-Type",
    "Authorization",
    "Idempotency-Key",
    "X-Requested-With",
  ],
};

export const createApp = (): Application => {
  const app: Application = express();

  app.disable("x-powered-by");
  app.set("trust proxy", 1);
  app.use((req, _res, next) => {
    const request = req as Request;
    request.requestId = crypto.randomUUID();
    next();
  });

  app.use(helmet());
  app.use(cors(corsOptions));
  app.options(/(.*)/, cors(corsOptions));
  app.use(
    express.json({
      limit: "1mb",
      verify: (req, _res, buffer) => {
        (req as Request).rawBody = buffer.toString("utf8");
      },
    }),
  );
  app.use(express.urlencoded({ extended: true, limit: "1mb" }));
  app.use(cookieParser(ENV.COOKIE_SECRET));
  app.use(hpp());
  app.use(
    rateLimit({
      windowMs: 15 * 60 * 1000,
      limit: 300,
      standardHeaders: true,
      legacyHeaders: false,

    }),
  );

  app.use(`${API_V1_PREFIX}/auth`, authRoute);
  app.use(`${API_V1_PREFIX}/user`, userRoute);

  app.use((req: Request, res: Response, next: NextFunction) => next(new AppError("Route not found.", 404)));
  app.use(globalErrorHandler);

  return app;
};

const app = createApp();
export default app;
