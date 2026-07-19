import InterviewSessionModel from "../models/interviewSession.model.ts";
import { signWebrtcToken } from "./token.service.ts";
import { AppError } from "../utils/appError.ts";
import { ENV } from "../config/envConfig.ts";
import crypto from "crypto";
import interviewSessionRepository from "../repositories/interviewSession.repository.ts";
import { Types } from "mongoose";
import { ensureJoinable, ensureSessionTimeActive } from "../utils/security.ts";

export const createWebrtcToken = async (
    userId: string,
    sessionId?: string,
    roomId?: string,
) => {
    const session = await getSessionForWebrtc(userId, sessionId, roomId);
    ensureSessionTimeActive(session);
    ensureJoinable(session);
    const token = signWebrtcToken({
        userId,
        sessionId: session._id.toString(),
        roomId: session.roomId,
        purpose: "webrtc",
    });

    return {
        token,
        sessionId: session._id.toString(),
        roomId: session.roomId,
        iceServers: buildIceServers(userId),
    };
};

export const getWebrtcRoomInfo = async (
    userId: string,
    sessionId?: string,
    roomId?: string,
) => {
    const session = await getSessionForWebrtc(userId, sessionId, roomId);
    ensureSessionTimeActive(session);
    ensureJoinable(session);
    return {
        sessionId: session._id.toString(),
        roomId: session.roomId,
        status: session.status,
        iceServers: buildIceServers(userId),
    };
};

export const validateIceCandidate = async (
    userId: string,
    sessionId?: string,
    roomId?: string,
) => {
    const session = await getSessionForWebrtc(userId, sessionId, roomId);
    ensureSessionTimeActive(session);
    ensureJoinable(session);
    return {
        sessionId: session._id.toString(),
        roomId: session.roomId,
        accepted: true,
    };
};

export const getSessionForWebrtc = async (
    userId: string,
    sessionId?: string,
    roomId?: string,
) => {
    const session = sessionId ? await interviewSessionRepository.findById(new Types.ObjectId(sessionId)) : roomId ? await interviewSessionRepository.findByRoomId(roomId) : null;

    if (!session) {
        throw new AppError("Session not found", 404);
    }

    const authorized =
        session.interviewerId.toString() === userId ||
        session.intervieweeId.toString() === userId;

    if (!authorized) {
        throw new AppError("Unauthorized access to interview room", 403);
    }

    return session;
};

const generateTurnCredentials = (userId: string) => {
    if (!ENV.TURN_SECRET) {
        return null;
    }

    const expiry = Math.floor(Date.now() / 1000) + ENV.TURN_TTL;
    const username = `${expiry}:${userId}`;

    const credential = crypto
        .createHmac("sha256", ENV.TURN_SECRET)
        .update(username)
        .digest("base64");

    return {
        username,
        credential,
    };
};

const buildIceServers = (userId: string) => {
    const iceServers: any[] = [];

    if (ENV.ICE_MODE === "public-stun") {
        iceServers.push({
            urls: [ENV.PUBLIC_STUN_URL],
        });
    }

    if (ENV.ICE_MODE === "coturn" && ENV.TURN_ENABLED) {
        // Coturn STUN
        iceServers.push({
            urls: [`stun:${ENV.TURN_HOST}:${ENV.TURN_PORT}`],
        });

        const turn = generateTurnCredentials(userId);

        if (turn) {
            // Coturn TURN
            iceServers.push({
                urls: [
                    `turn:${ENV.TURN_HOST}:${ENV.TURN_PORT}?transport=udp`,
                    `turn:${ENV.TURN_HOST}:${ENV.TURN_PORT}?transport=tcp`,
                    `turns:${ENV.TURN_TLS_PORT}`,
                ],

                username: turn.username,
                credential: turn.credential,
            });
        }
    }

    return iceServers;
};

