import { Server as HttpServer } from "http";
import { Server, Socket } from "socket.io";
import { Types } from "mongoose";
import { verifyAccessToken } from "../services/token.service.ts";
import { UserRepository } from "../repositories/user.repository.ts";
import { MatchRepository } from "../repositories/match.repository.ts";
import profileRepository from "../repositories/profile.repository.ts";
import InterviewSessionModel, { InterviewSessionStatus } from "../models/interviewSession.model.ts";
import { UserStatus } from "../types/user.types.ts";
import { type IInterview } from "../types/match.types.ts";
import { ENV } from "../config/envConfig.ts";

let io: Server;

// Tracking online users: userId -> socketId
const onlineUsers = new Map<string, string>();

const isWithinAvailability = (availability: Array<{ day: string; startTime: string; endTime: string }> | undefined) => {
  if (!availability || availability.length === 0) return true;

  const currentDay = new Date().toLocaleString("en-US", { weekday: "long" }).toUpperCase();
  const currentTimeStr = new Date().toLocaleTimeString("en-US", { hour12: false, hour: "2-digit", minute: "2-digit" });

  const todaySlots = availability.filter((slot) => slot.day === currentDay);
  if (todaySlots.length === 0) return false;

  return todaySlots.some((slot) => currentTimeStr >= slot.startTime && currentTimeStr <= slot.endTime);
};

const isUserEligibleForRequest = (
  request: IInterview,
  requesterProfile: { profileCompletion: number; targetRole: string },
  candidateProfile: { profileCompletion: number; targetRole: string; availability?: Array<{ day: string; startTime: string; endTime: string }> },
  activeSessionUserIds: Set<string>,
  candidateUserId: string,
) => {
  if (request.userId.toString() === candidateUserId) return false;
  if (activeSessionUserIds.has(candidateUserId)) return false;
  if (candidateProfile.profileCompletion < requesterProfile.profileCompletion) return false;
  if (candidateProfile.targetRole !== request.preferredRole) return false;
  if (!isWithinAvailability(candidateProfile.availability)) return false;
  return true;
};

const notifyPendingRequestsForUser = async (userId: string) => {
  const candidateProfile = await profileRepository.findByUserId(userId);
  if (!candidateProfile) return;

  const activeRequests = await MatchRepository.findSearchingRequests();
  if (activeRequests.length === 0) return;

  const activeSessions = await InterviewSessionModel.find({
    status: { $in: [InterviewSessionStatus.SCHEDULED, InterviewSessionStatus.READY, InterviewSessionStatus.JOINED, InterviewSessionStatus.ACTIVE] },
  });

  const busyUserIds = new Set<string>();
  for (const session of activeSessions) {
    busyUserIds.add(session.interviewerId.toString());
    busyUserIds.add(session.intervieweeId.toString());
  }

  for (const request of activeRequests) {
    const requesterProfile = await profileRepository.findByUserId(request.userId.toString());
    if (!requesterProfile) continue;

    const eligible = isUserEligibleForRequest(
      request as IInterview,
      { profileCompletion: requesterProfile.profileCompletion, targetRole: String(request.preferredRole) },
      {
        profileCompletion: candidateProfile.profileCompletion,
        targetRole: String(candidateProfile.targetRole),
        availability: candidateProfile.availability as Array<{ day: string; startTime: string; endTime: string }> | undefined,
      },
      busyUserIds,
      userId,
    );

    if (!eligible) continue;

    const alreadyNotified = request.notifiedUsers?.some(
      (entry) => entry.userId.toString() === userId && entry.status === "PENDING",
    );

    if (!alreadyNotified) {
      await MatchRepository.addNotifiedUser(request._id as Types.ObjectId, new Types.ObjectId(userId));
    }

    const requester = await UserRepository.findById(request.userId.toString());
    emitToUser(userId, "interview-request", {
      requestId: request._id.toString(),
      requesterId: request.userId.toString(),
      requesterName: requester?.name ?? null,
      interviewType: request.interviewType,
      preferredRole: request.preferredRole,
      difficulty: request.difficulty,
      preferredLanguage: request.preferredLanguage,
      duration: request.duration,
      description: request.description ?? null,
      requesterHeadline: requesterProfile.headline ?? null,
      expiresAt: request.expirationTimestamp,
    });
  }
};

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

      (socket as any).user = {
        id: user._id.toString(),
        role: user.role,
      };

      next();
    } catch {
      next(new Error("Authentication error"));
    }
  });

  io.on("connection", (socket: Socket) => {
    const userId = (socket as any).user.id;
    onlineUsers.set(userId, socket.id);
    console.log(`User connected: ${userId} (Socket: ${socket.id})`);

    void notifyPendingRequestsForUser(userId).catch((error) => {
      console.error("Failed to backfill pending interview requests:", error);
    });

    socket.on("accept-interview", (_data: { requestId: string }) => {
      // Handled by API for transactional safety.
    });

    socket.on("reject-interview", (_data: { requestId: string }) => {
      // Optional: Handle rejection real-time.
    });

    socket.on("join-room", (data: { roomId: string }) => {
      socket.join(data.roomId);
      socket.to(data.roomId).emit("user-joined", { userId });
    });

    socket.on("leave-room", (data: { roomId: string }) => {
      socket.leave(data.roomId);
      socket.to(data.roomId).emit("user-left", { userId });
    });

    socket.on("webrtc-offer", (data: { roomId: string; offer: any }) => {
      socket.to(data.roomId).emit("webrtc-offer", { offer: data.offer, senderId: userId });
    });

    socket.on("webrtc-answer", (data: { roomId: string; answer: any }) => {
      socket.to(data.roomId).emit("webrtc-answer", { answer: data.answer, senderId: userId });
    });

    socket.on("webrtc-ice-candidate", (data: { roomId: string; candidate: any }) => {
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

export function emitToUser(userId: string, event: string, data: any) {
  const socketId = onlineUsers.get(userId);
  if (socketId) {
    io.to(socketId).emit(event, data);
  }
}
