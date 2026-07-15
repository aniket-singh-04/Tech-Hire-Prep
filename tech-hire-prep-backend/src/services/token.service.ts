import jwt from "jsonwebtoken";
import { AppError } from "../utils/appError.ts";
import { ENV } from "../config/envConfig.ts";
import { JwtAccessPayload, JwtRefreshPayload } from "../types/auth.types.ts";

const ACCESS_ISSUER = ENV.JWT_ACCESS_ISSUER;
const REFRESH_ISSUER = ENV.JWT_REFRESH_ISSUER;

const normalizeJwtError = (
    error: unknown,
    expiredMessage: string,
    invalidMessage: string,
): never => {
    if (error instanceof jwt.TokenExpiredError) {
        throw new AppError(expiredMessage, 401);
    }

    if (
        error instanceof jwt.JsonWebTokenError ||
        error instanceof jwt.NotBeforeError
    ) {
        throw new AppError(invalidMessage, 401);
    }

    throw error;
};

export const signAccessToken = (
    payload: JwtAccessPayload,
): string => {
    return jwt.sign(payload, ENV.JWT_ACCESS_SECRET, {
        issuer: ACCESS_ISSUER,
        expiresIn: `${ENV.ACCESS_TOKEN_TTL_MINUTES}m`,
    });
};

export const verifyAccessToken = (token: string,): JwtAccessPayload => {
    try {
        return jwt.verify(token, ENV.JWT_ACCESS_SECRET, {
            issuer: ENV.JWT_ACCESS_ISSUER,
        }) as JwtAccessPayload;
    } catch (error) {
        if (error instanceof jwt.TokenExpiredError) {
            throw new AppError("Access token has expired.", 401);
        }

        if (
            error instanceof jwt.JsonWebTokenError ||
            error instanceof jwt.NotBeforeError
        ) {
            throw new AppError("Invalid access token.", 401);
        }

        throw error;
    }
};

export const signRefreshToken = (payload: JwtRefreshPayload,): string => {
    return jwt.sign(payload, ENV.JWT_REFRESH_SECRET, {
        issuer: REFRESH_ISSUER,
        expiresIn: `${ENV.REFRESH_TOKEN_TTL_DAYS}d`,
    });
};

export const verifyRefreshToken = (token: string,): JwtRefreshPayload => {
    try {
        return jwt.verify(token, ENV.JWT_REFRESH_SECRET, {
            issuer: REFRESH_ISSUER,
        }) as JwtRefreshPayload;
    } catch (error) {
        if (error instanceof jwt.TokenExpiredError) {
            throw new AppError("Session has expired.", 401);
        }

        if (
            error instanceof jwt.JsonWebTokenError ||
            error instanceof jwt.NotBeforeError
        ) {
            throw new AppError("Invalid refresh token.", 401);
        }

        throw error;
    }
};

export interface JwtWebrtcPayload {
    userId: string;
    sessionId: string;
    roomId: string;
    purpose: "webrtc";
}

export const signWebrtcToken = (payload: JwtWebrtcPayload,): string => {
    return jwt.sign(payload, ENV.JWT_ACCESS_SECRET, {
        issuer: `${ACCESS_ISSUER}:webrtc`,
        expiresIn: "15m",
    });
};
