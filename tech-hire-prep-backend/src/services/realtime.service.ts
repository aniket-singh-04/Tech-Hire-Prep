import type { Server as HttpServer } from "http";
import { Server } from "socket.io";
import { ENV } from "../config/envConfig.js";
import { InterviewSession } from "../models/interview-session.model.js";
import { verifyAccessToken } from "../modules/auth/token.service.js";

let io: Server | null = null;

const socketAuth = (token?: string) => {
  if (!token) throw new Error("Unauthorized");
  return verifyAccessToken(token);
};

export const initRealtime = (server: HttpServer) => {
  io = new Server(server, {
    path: "/ws",
    cors: {
      origin: ENV.CORS_ORIGINS,
      credentials: true,
    },
  });

  const authenticate = async (socket: Parameters<Server["use"]>[0] extends (socket: infer S, next: infer N) => void ? S : never, next: (error?: Error) => void) => {
    try {
      const authToken = typeof socket.handshake.auth.token === "string"
        ? socket.handshake.auth.token
        : typeof socket.handshake.headers.authorization === "string" && socket.handshake.headers.authorization.startsWith("Bearer ")
          ? socket.handshake.headers.authorization.slice(7)
          : undefined;
      socket.data.user = socketAuth(authToken);
      next();
    } catch {
      next(new Error("Unauthorized"));
    }
  };

  const matchmakingNamespace = io.of("/matchmaking");
  matchmakingNamespace.use(authenticate);
  matchmakingNamespace.on("connection", (socket) => {
    const userId = socket.data.user.sub as string;
    socket.join(`user:${userId}`);
    socket.emit("matchmaking:connected", { userId });
  });

  const sessionNamespace = io.of("/sessions");
  sessionNamespace.use(authenticate);
  sessionNamespace.on("connection", async (socket) => {
    const userId = socket.data.user.sub as string;
    const sessionId = typeof socket.handshake.auth.sessionId === "string"
      ? socket.handshake.auth.sessionId
      : typeof socket.handshake.query.sessionId === "string"
        ? socket.handshake.query.sessionId
        : undefined;

    if (!sessionId) {
      socket.disconnect();
      return;
    }

    const session = await InterviewSession.findById(sessionId).lean();
    if (!session || !session.participants.some((item) => item.userId.toString() === userId)) {
      socket.disconnect();
      return;
    }

    const room = `session:${sessionId}`;
    socket.join(room);
    socket.emit("session:snapshot", {
      sessionId,
      editor: session.editor,
      participants: session.participants.map((item) => ({ userId: item.userId.toString(), role: item.role })),
      signals: session.webrtcSignals.slice(-20),
    });
    sessionNamespace.to(room).emit("session:presence", { userId, status: "joined" });

    socket.on("webrtc:signal", (payload) => {
      socket.to(room).emit("webrtc:signal", { fromUserId: userId, ...payload });
    });

    socket.on("editor:update", (payload) => {
      socket.to(room).emit("editor:update", {
        ...payload,
        userId,
        updatedAt: new Date().toISOString(),
      });
    });

    socket.on("disconnect", () => {
      sessionNamespace.to(room).emit("session:presence", { userId, status: "left" });
    });
  });

  return io;
};

export const emitMatchStatus = (userId: string, payload: unknown) => {
  io?.of("/matchmaking").to(`user:${userId}`).emit("matchmaking:update", payload);
};

export const emitSessionEvent = (sessionId: string, event: string, payload: unknown) => {
  io?.of("/sessions").to(`session:${sessionId}`).emit(event, payload);
};
