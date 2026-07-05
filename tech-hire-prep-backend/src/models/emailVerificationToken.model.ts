import mongoose, { HydratedDocument, Model, Schema, model, } from "mongoose";
import { IEmailVerificationToken, VerificationPurpose } from "../types/emailverify.type.ts";

export type EmailVerificationTokenDocument = HydratedDocument<IEmailVerificationToken>;

const emailVerificationTokenSchema = new Schema<IEmailVerificationToken>(
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
      enum: Object.values(VerificationPurpose),
      required: true,
      index: true,
    },

    resendCount: {
      type: Number,
      default: 0,
      min: 0,
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

export const EmailVerificationTokenModel: Model<IEmailVerificationToken> =
  mongoose.models.EmailVerificationToken ??
  model<IEmailVerificationToken>(
    "EmailVerificationToken",
    emailVerificationTokenSchema
  );