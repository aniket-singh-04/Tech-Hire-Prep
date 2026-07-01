import mongoose, { Schema, type HydratedDocument, type Model } from "mongoose";

export type UserRole = "student" | "admin";
export type UserStatus = "active" | "suspended" | "deleted";

export type RefreshTokenRecord = {
  tokenHash: string;
  expiresAt: Date;
  createdAt: Date;
  rotatedAt?: Date;
  revokedAt?: Date;
};

export type UserAttrs = {
  email: string;
  name: string;
  passwordHash: string;
  role: UserRole;
  status: UserStatus;
  isEmailVerified: boolean;
  avatarUrl?: string;
  refreshTokens: RefreshTokenRecord[];
  lastLoginAt?: Date;
  deletedAt?: Date;
};

export type UserDocument = HydratedDocument<UserAttrs>;

const refreshTokenSchema = new Schema<RefreshTokenRecord>({
  tokenHash: { type: String, required: true },
  expiresAt: { type: Date, required: true },
  createdAt: { type: Date, required: true, default: Date.now },
  rotatedAt: { type: Date },
  revokedAt: { type: Date },
}, { _id: false });

const userSchema = new Schema<UserAttrs>({
  email: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
  name: { type: String, required: true, trim: true, maxlength: 80 },
  passwordHash: { type: String, required: true, select: false },
  role: { type: String, enum: ["student", "admin"], default: "student", required: true },
  status: { type: String, enum: ["active", "suspended", "deleted"], default: "active", required: true },
  isEmailVerified: { type: Boolean, default: false, required: true },
  avatarUrl: { type: String },
  refreshTokens: { type: [refreshTokenSchema], default: [], select: false },
  lastLoginAt: { type: Date },
  deletedAt: { type: Date },
}, { timestamps: true });

export const User: Model<UserAttrs> =
  mongoose.models.User ?? mongoose.model<UserAttrs>("User", userSchema);
