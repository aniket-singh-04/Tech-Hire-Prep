import { ENV } from "./envConfig.js";

export type AppRuntime = "lambda" | "ec2";

export const getAppRuntime = (): AppRuntime =>
  ENV.APP_RUNTIME === "lambda" || ENV.APP_RUNTIME === "ec2"
    ? ENV.APP_RUNTIME
    : process.env.AWS_LAMBDA_FUNCTION_NAME
      ? "lambda"
      : "ec2";
