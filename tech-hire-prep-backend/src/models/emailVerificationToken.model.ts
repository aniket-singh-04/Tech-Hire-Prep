import mongoose, { Schema, model, } from "mongoose";
import { TokenPurpose } from "../types/token.types.ts";

const pendingChangesSchema = new Schema(
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
  },
  {
    _id: false,
    strict: "throw",
  },
);

const emailVerificationTokenSchema =
  new Schema(
    {
      userId: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: "User",
        index: true,
      },

      tokenHash: {
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

      purpose: {
        type: String,
        enum: Object.values(TokenPurpose),
        required: true,
        index: true,
      },

      pendingChanges: {
        type: pendingChangesSchema,
        default: null,
      },

      resendCount: {
        type: Number,
        default: 0,
        min: 0,
      },

      ipHash: {
        type: String,
        default: null,
      },

      userAgentHash: {
        type: String,
        default: null,
      },
    },
    {
      timestamps: true,
      versionKey: false,
      strict: "throw",
    },
  );

/* ---------------- Indexes ---------------- */

emailVerificationTokenSchema.index({
  userId: 1,
  purpose: 1,
  consumedAt: 1,
});

emailVerificationTokenSchema.index({
  expiresAt: 1,
  consumedAt: 1,
});

export const EmailVerificationTokenModel =
  mongoose.models.EmailVerificationToken ??
  model(
    "EmailVerificationToken",
    emailVerificationTokenSchema,
  );