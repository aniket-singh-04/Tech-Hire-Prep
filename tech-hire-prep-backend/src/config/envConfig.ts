import dotenv from 'dotenv';
import { z } from "zod";
dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().int().positive().default(2300),
  MONGO_URI: z.string().min(1).default("mongodb://127.0.0.1:27017/tech-hire-prep"),
  MONGO_REPLICA_SET: z.string().default(""),
  APP_RUNTIME: z.enum(["lambda", "ec2"]).default(
    process.env.AWS_LAMBDA_FUNCTION_NAME ? "lambda" : "ec2",
  ),
  ACCESS_TOKEN_SECRET: z.string().min(32).optional(),
  REFRESH_TOKEN_SECRET: z.string().min(32).optional(),
  ACCESS_TOKEN_TTL_SECONDS: z.coerce.number().int().positive().default(900),
  REFRESH_TOKEN_TTL_DAYS: z.coerce.number().int().positive().default(30),
  CORS_ORIGIN: z.string().default("http://localhost:3000"),
});

const parsed = envSchema.parse(process.env);

if (parsed.NODE_ENV === "production") {
  if (!parsed.ACCESS_TOKEN_SECRET || !parsed.REFRESH_TOKEN_SECRET) {
    throw new Error(
      "ACCESS_TOKEN_SECRET and REFRESH_TOKEN_SECRET must be set in production.",
    );
  }
}

const devSecret = "development-only-secret-change-before-production";

export const ENV = {
  ...parsed,
  ACCESS_TOKEN_SECRET: parsed.ACCESS_TOKEN_SECRET ?? devSecret,
  REFRESH_TOKEN_SECRET: parsed.REFRESH_TOKEN_SECRET ?? `${devSecret}-refresh`,
} as const;
