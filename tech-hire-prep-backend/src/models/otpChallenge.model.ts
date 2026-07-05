import mongoose, { HydratedDocument, Model, Schema, model, } from "mongoose";

import { OtpPurpose, UserRole, } from "../types/user.types.ts";
import { IOtpChallenge } from "../types/otpchallange.type.ts";

interface PendingUserSchema {
  name: string;
  email: string;
  phone?: string;
  passwordHash: string;
  role?: UserRole;
}

const pendingUserSchema = new Schema<PendingUserSchema>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },

    phone: {
      type: String,
      trim: true,
    },

    passwordHash: {
      type: String,
      required: true,
    },

    role: {
      type: String,
      enum: Object.values(UserRole),
    }
  },
  {
    _id: false,
    strict: "throw",
  },
);


export type OtpChallengeDocument = HydratedDocument<IOtpChallenge>;
const otpChallengeSchema = new Schema<IOtpChallenge>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      index: true,
      default: null,
    },

    purpose: {
      type: String,
      enum: Object.values(OtpPurpose),
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

export const OtpChallengeModel: Model<IOtpChallenge> =
  (mongoose.models.OtpChallenge as Model<IOtpChallenge>) ??
  model<IOtpChallenge>(
    "OtpChallenge",
    otpChallengeSchema,
  );