import { connectDB } from "./config/database.js";
import { ENV } from "./config/envConfig.js";
import http from "http";
import app from "./app.js";

const server = http.createServer(app);


const bootstrap = async (): Promise<void> => {
  try {
    await connectDB();

    server.listen(ENV.PORT, () => {
      console.log(`Server running at http://localhost:${ENV.PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server", error);
    process.exit(1);
  }
};

bootstrap();
