import express, {
  type Application,
  type NextFunction,
  type Request,
  type Response,
} from "express";
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
import matchRoute from "./routes/match.routes.ts";
import sessionRoute from "./routes/session.routes.ts";
import walletRoute from "./routes/wallet.routes.ts";
import webrtcRoute from "./routes/webrtc.routes.ts";
import editorRoute from "./routes/editor.routes.ts";
import paymentRoute from "./routes/payment.routes.ts";
export const API_V1_PREFIX = "/api/v1";

const corsOptions = {
  origin(
    origin: string | undefined,
    callback: (error: Error | null, allow?: boolean) => void,
  ) {
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
  const logger = (req: Request, res: Response, next: NextFunction) => {
    const start = Date.now();

    console.log("\n========== REQUEST ==========");
    console.log(`${req.method} ${req.originalUrl}`);
    console.log("Body:", req.body);

    const originalSend = res.send;
    const originalJson = res.json;

    const logResponse = (body:any) => {
      console.log("========== RESPONSE ==========");
      console.log("Status:", res.statusCode);
      console.log("Body:", body);
      console.log(`Time: ${Date.now() - start} ms`);
    };

    res.send = function (body) {
      logResponse(body);
      return originalSend.call(this, body);
    };

    res.json = function (body) {
      logResponse(body);
      return originalJson.call(this, body);
    };

    next();
  };

  app.use(logger);

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
  app.use(`${API_V1_PREFIX}/match`, matchRoute);
  app.use(`${API_V1_PREFIX}/session`, sessionRoute);
  app.use(`${API_V1_PREFIX}/webrtc`, webrtcRoute);
  app.use(`${API_V1_PREFIX}/wallet`, walletRoute);
  app.use(`${API_V1_PREFIX}/editor`, editorRoute);
  app.use(`${API_V1_PREFIX}/payments`, paymentRoute);

  app.use((req: Request, res: Response, next: NextFunction) =>
    next(new AppError("Route not found.", 404)),
  );
  app.use(globalErrorHandler);

  return app;
};

const app = createApp();
export default app;
