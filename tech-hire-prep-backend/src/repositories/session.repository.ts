import { Types } from "mongoose";
import SessionModel from "../models/session.model.ts";


export class SessionRepository {
  static async create(data: {
    userId: Types.ObjectId;
    refreshTokenHash: string;
    jti: string;
    userAgentHash?: string;
    ipHash?: string;
    expiresAt: Date;
    revoked: Boolean;
  }) {
    return SessionModel.create(data);
  }

  static async findById(id: string) {
    return SessionModel.findById(id);
  }

  static async findByRefreshToken(refreshToken: string) {
    return SessionModel.findOne({ refreshToken });
  }

  static async findActiveByUser(userId: string) {
    return SessionModel.find({
      userId,
      revoked: false,
      expiresAt: { $gt: new Date() },
    }).sort({
      createdAt: 1,
    });
  }

  static async revoke(sessionId: string) {
    return SessionModel.findByIdAndUpdate(
      sessionId,
      {
        revoked: true,
        revokedAt: new Date(),
      },
      { new: true }
    );
  }

  static async revokeByRefreshToken(refreshToken: string) {
    return SessionModel.findOneAndUpdate(
      { refreshToken },
      {
        revoked: true,
        revokedAt: new Date(),
      },
      { new: true }
    );
  }

  static async revokeAllUserSessions(userId: string) {
    return SessionModel.updateMany(
      { userId, revoked: false },
      {
        revoked: true,
        revokedAt: new Date(),
      }
    );
  }

  static async deleteExpired() {
    return SessionModel.deleteMany({
      expiresAt: { $lte: new Date() },
    });
  }
}