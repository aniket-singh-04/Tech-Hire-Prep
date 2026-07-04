import mongoose, { Schema, model, InferSchemaType, } from "mongoose";
import { SessionRevokeReason } from "../types/session.types.ts";

const sessionSchema = new Schema(
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

export type SessionDocument =
  InferSchemaType<typeof sessionSchema>;

const Session =
  mongoose.models.Session ??
  model("Session", sessionSchema);

export default Session;