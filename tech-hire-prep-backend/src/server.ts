import http from "http";
import app from "./app.js";
import { connectDB } from "./config/database.js";
import { ENV } from "./config/envConfig.js";
import { connectRedis } from "./config/redis.js";
import { initRealtime } from "./services/realtime.service.js";

const server = http.createServer(app);

const bootstrap = async (): Promise<void> => {
  try {
    await connectDB();
    await connectRedis().catch((error) => {
      console.warn("Redis unavailable. Continuing without Redis-backed features.", error);
      return null;
    });
    initRealtime(server);

    server.listen(ENV.PORT, () => {
      console.log(`Server running at http://localhost:${ENV.PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server", error);
    process.exit(1);
  }
};

bootstrap();
