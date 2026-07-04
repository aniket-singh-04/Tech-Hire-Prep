import mongoose from "mongoose";
import { ENV } from "./envConfig.ts";

let connectionPromise: Promise<typeof mongoose> | null = null;
let listenersAttached = false;

const attachConnectionListeners = () => {
  if (listenersAttached) return;
  listenersAttached = true;

  mongoose.connection.on("connected", () => console.log("MongoDB connected"));
  mongoose.connection.on("disconnected", () => console.warn("MongoDB disconnected"));
  mongoose.connection.on("error", (error) => console.error("MongoDB error", error));
};

const getConnectionUri = () => {
  if (ENV.MONGO_URI.startsWith("mongodb+srv://")) {
    return ENV.MONGO_URI;
  }


  return ENV.MONGO_URI;
  
};

export const connectDB = async () => {
  if (mongoose.connection.readyState === 1) return mongoose;
  if (connectionPromise) return connectionPromise;

  attachConnectionListeners();
  connectionPromise = mongoose.connect(getConnectionUri(), {
    maxPoolSize: 20,
    serverSelectionTimeoutMS: 10000,
  }).catch((error) => {
    connectionPromise = null;
    throw error;
  });

  return connectionPromise;
};

export const getMongoHealth = () => ({
  readyState: mongoose.connection.readyState,
  connected: mongoose.connection.readyState === 1,
});
