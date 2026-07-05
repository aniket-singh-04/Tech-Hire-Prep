import mongoose, { Schema, InferSchemaType, Model, HydratedDocument, } from "mongoose";
import { ISession, SessionRevokeReason } from "../types/session.types.ts";

export type SessionDocument = HydratedDocument<ISession>;
const sessionSchema = new Schema<ISession>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "User",
      index: true,
    },

    refreshTokenHash: {
      type: String,
      required: true,
    },

    jti: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },

    userAgentHash: {
      type: String,
      default: null,
    },

    ipHash: {
      type: String,
      default: null,
    },

    lastUsedAt: {
      type: Date,
      default: Date.now,
      index: true,
    },

    expiresAt: {
      type: Date,
      required: true,
      expires: 0,
      index: true,
    },

    rotatedAt: {
      type: Date,
      default: null,
    },
    revoked: {
      type: Boolean,
      default: false,
    },
    revokedAt: {
      type: Date,
      default: null,
      index: true,
    },

    revokeReason: {
      type: String,
      enum: Object.values(SessionRevokeReason),
      default: null,
    },
  },
  {
    timestamps: true,
    versionKey: false,
    strict: "throw",
  },
);

/* ---------------------- Indexes ---------------------- */

sessionSchema.index({
  userId: 1,
  revokedAt: 1,
});

sessionSchema.index({
  expiresAt: 1,
  revokedAt: 1,
});

sessionSchema.index({
  userId: 1,
  createdAt: -1,
});

/* ----------------------- Types ----------------------- */

const SessionModel: Model<ISession> =
  mongoose.models.Session ??
  mongoose.model<ISession>("Session", sessionSchema);

export default SessionModel;