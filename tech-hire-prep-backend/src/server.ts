import http from "http";
import app from "./app.ts";
import { ENV } from "./config/envConfig.ts";
import { connectDB } from "./config/database.ts";

const server = http.createServer(app);

const bootstrap = async (): Promise<void> => {
  try {
    await connectDB(); 
  } catch (error) {
    if (ENV.NODE_ENV === "production") {
      console.error("Failed to start server", error);
      process.exit(1);
    }

    console.warn("Database unavailable. Continuing without DB-backed features.", error);
  }

  server.listen(ENV.PORT, () => {
    console.log(`Server running at http://localhost:${ENV.PORT}`);
  });
};

bootstrap();
