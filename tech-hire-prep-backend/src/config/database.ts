import mongoose from 'mongoose';
import { ENV } from "./envConfig.js";

let connectionPromise: Promise<typeof mongoose> | null = null;
let listenersAttached = false;

const attachConnectionListeners = () => {
    if (listenersAttached) {
        return;
    }

    listenersAttached = true;

    mongoose.connection.on("connected", () => {
        console.log("Database is connected");
    });

    mongoose.connection.on("disconnected", () => {
        console.error("Database is disconnected");
    });

    mongoose.connection.on("error", (err) => {
        console.error("Database error:", err);
    });
}

export async function connectDB() {
    if (mongoose.connection.readyState === 1) {
        return mongoose;
    }

    if (connectionPromise) {
        return connectionPromise;
    }

    attachConnectionListeners();



    const connectionUri = ENV.MONGO_URI.startsWith("mongodb+srv://") ? ENV.MONGO_URI : ENV.MONGO_REPLICA_SET ? `${ENV.MONGO_URI}${ENV.MONGO_URI.includes("?") ? "&" : "?"}replicaSet=${ENV.MONGO_REPLICA_SET}` : ENV.MONGO_URI;

    connectionPromise = mongoose
        .connect(connectionUri, {
            maxPoolSize: 20,  
            serverSelectionTimeoutMS: 10000,
        })
        .catch((err) => {
            console.error("Failed to connect to MongoDB", err);
            connectionPromise = null;
            throw err;
        });

    return connectionPromise;
}

