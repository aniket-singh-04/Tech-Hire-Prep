import mongoose, { Schema, model, } from "mongoose";

import { Purpose, UserRole, } from "../types/user.types.ts";

const pendingUserSchema = new Schema(
  {
    name: {
      type: String,
      trim: true,
    },

    email: {
      type: String,
      trim: true,
      lowercase: true,
    },

    phone: {
      type: String,
      trim: true,
    },

    passwordHash: {
      type: String,
    },

    role: {
      type: String,
      enum: Object.values(UserRole),
    },

    gstNumber: {
      type: String,
      trim: true,
    },
  },
  {
    _id: false,
    strict: "throw",
  },
);

const otpChallengeSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      index: true,
      default: null,
    },

    purpose: {
      type: String,
      enum: Object.values(Purpose),
      required: true,
      index: true,
    },

    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },

    codeHash: {
      type: String,
      required: true,
      minlength: 64,
      maxlength: 64,
    },

    expiresAt: {
      type: Date,
      required: true,
      expires: 0,
      index: true,
    },

    consumedAt: {
      type: Date,
      default: null,
      index: true,
    },

    attempts: {
      type: Number,
      default: 0,
      min: 0,
    },

    maxAttempts: {
      type: Number,
      default: 5,
      min: 1,
    },

    resendCount: {
      type: Number,
      default: 0,
      min: 0,
    },

    pendingUser: {
      type: pendingUserSchema,
      default: null,
    },

    ipHash: {
      type: String,
      default: null,
    },

    userAgentHash: {
      type: String,
      default: null,
    },

    metadata: {
      type: Map,
      of: Schema.Types.Mixed,
      default: () => new Map(),
    },
  },
  {
    timestamps: true,
    versionKey: false,
    strict: "throw",
  },
);

/* ---------------------- Indexes ---------------------- */

otpChallengeSchema.index({
  email: 1,
  purpose: 1,
  consumedAt: 1,
});

otpChallengeSchema.index({
  expiresAt: 1,
  consumedAt: 1,
});

otpChallengeSchema.index({
  userId: 1,
  purpose: 1,
});

export const OtpChallengeModel =
  mongoose.models.OtpChallenge ??
  model(
    "OtpChallenge",
    otpChallengeSchema,
  );