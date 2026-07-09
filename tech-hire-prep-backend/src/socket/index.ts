import { Server as HttpServer } from "http";
import { Server, Socket } from "socket.io";
import { verifyAccessToken } from "../services/token.service.ts";
import { UserRepository } from "../repositories/user.repository.ts";
import { UserStatus } from "../types/user.types.ts";
import { ENV } from "../config/envConfig.ts";

let io: Server;

// Tracking online users: userId -> socketId
const onlineUsers = new Map<string, string>();

export const initSocketServer = (server: HttpServer) => {
  io = new Server(server, {
    cors: {
      origin: ENV.CORS_ORIGINS,
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  // Authentication Middleware
  io.use(async (socket: Socket, next) => {
    try {
      const token = socket.handshake.auth?.token || socket.handshake.headers?.authorization?.split(" ")[1];
      if (!token) {
        return next(new Error("Authentication error"));
      }

      const payload = verifyAccessToken(token);
      const user = await UserRepository.findById(payload.userId);

      if (!user || user.status === UserStatus.DELETED) {
        return next(new Error("Authentication error"));
      }

      // Attach user info to socket
      (socket as any).user = {
        id: user._id.toString(),
        role: user.role,
      };

      next();
    } catch (error) {
      next(new Error("Authentication error"));
    }
  });

  io.on("connection", (socket: Socket) => {
    const userId = (socket as any).user.id;
    onlineUsers.set(userId, socket.id);
    console.log(`User connected: ${userId} (Socket: ${socket.id})`);

    // Interview Request Flow
    socket.on("accept-interview", (data: { requestId: string }) => {
      // Handled by API usually, but we could handle here. For now, we will handle acceptance via API to ensure transactional safety.
    });

    socket.on("reject-interview", (data: { requestId: string }) => {
      // Optional: Handle rejection real-time
    });

    // WebRTC Signaling Events
    socket.on("join-room", (data: { roomId: string }) => {
      socket.join(data.roomId);
      socket.to(data.roomId).emit("user-joined", { userId });
    });

    socket.on("leave-room", (data: { roomId: string }) => {
      socket.leave(data.roomId);
      socket.to(data.roomId).emit("user-left", { userId });
    });

    socket.on("webrtc-offer", (data: { roomId: string, offer: any }) => {
      socket.to(data.roomId).emit("webrtc-offer", { offer: data.offer, senderId: userId });
    });

    socket.on("webrtc-answer", (data: { roomId: string, answer: any }) => {
      socket.to(data.roomId).emit("webrtc-answer", { answer: data.answer, senderId: userId });
    });

    socket.on("webrtc-ice-candidate", (data: { roomId: string, candidate: any }) => {
      socket.to(data.roomId).emit("webrtc-ice-candidate", { candidate: data.candidate, senderId: userId });
    });

    socket.on("disconnect", () => {
      onlineUsers.delete(userId);
      console.log(`User disconnected: ${userId}`);
    });
  });

  return io;
};

export const getIO = (): Server => {
  if (!io) {
    throw new Error("Socket.io not initialized");
  }
  return io;
};

export const getOnlineUsers = () => onlineUsers;

export const emitToUser = (userId: string, event: string, data: any) => {
  const socketId = onlineUsers.get(userId);
  if (socketId) {
    io.to(socketId).emit(event, data);
  }
};
