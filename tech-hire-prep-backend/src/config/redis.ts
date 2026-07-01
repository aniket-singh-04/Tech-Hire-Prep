import { createClient, type RedisClientType } from "redis";
import { ENV } from "./envConfig.js";

let redisClient: RedisClientType | null = null;
let redisState: "disabled" | "connecting" | "ready" | "error" = ENV.REDIS_URL ? "connecting" : "disabled";

export const connectRedis = async () => {
  if (!ENV.REDIS_URL) {
    redisState = "disabled";
    return null;
  }

  if (redisClient?.isOpen) {
    redisState = "ready";
    return redisClient;
  }

  redisClient = createClient({ url: ENV.REDIS_URL });
  redisClient.on("error", (error) => {
    redisState = "error";
    console.error("Redis error", error);
  });

  redisState = "connecting";
  await redisClient.connect();
  redisState = "ready";
  console.log("Redis connected");
  return redisClient;
};

export const getRedisClient = () => redisClient;

export const getRedisHealth = () => ({
  configured: Boolean(ENV.REDIS_URL),
  state: redisState,
  connected: Boolean(redisClient?.isOpen),
});
