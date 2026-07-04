import mongoose, { HydratedDocument, Model, Schema, } from "mongoose";
import { IUser, UserRole, UserStatus } from "../types/user.types.ts";


export type UserDocument = HydratedDocument<IUser>;

const avatarSchema = new Schema(
  {
    s3Key: {
      type: String,
      trim: true,
      default: "",
    },

    updatedAt: {
      type: Date,
      default: null,
    },
  },
  {
    _id: false,
    strict: "throw",
  },
);

const userSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      index: true,
    },

    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 80,
    },

    password: {
      type: String,
      required: true,
      select: false,
    },

    role: {
      type: String,
      enum: Object.values(UserRole),
      required: true,
      default: UserRole.STUDENT,
      index: true,
    },

    status: {
      type: String,
      enum: Object.values(UserStatus),
      required: true,
      default: UserStatus.ACTIVE,
      index: true,
    },

    isEmailVerified: {
      type: Boolean,
      required: true,
      default: false,
    },

    avatarUrl: {
      type: avatarSchema,
      default: () => ({
        s3Key: "",
        updatedAt: null,
      }),
    },

    emailVerifiedAt: {
      type: Date,
      default: null,
    },

    lastLoginAt: {
      type: Date,
      default: null,
    },

    deletedAt: {
      type: Date,
      default: null,
      index: true,
      select: false,
    },
  },
  {
    timestamps: true,
    versionKey: false,
    strict: "throw",
  },
);

/* ----------------------- Compound Indexes ----------------------- */

userSchema.index({
  status: 1,
  deletedAt: 1,
});

userSchema.index({
  role: 1,
  status: 1,
});

userSchema.index({
  emailVerifiedAt: 1,
});


/* --------------------------- Model ------------------------------ */

export const UserModel: Model<IUser> =
  mongoose.models.User ??
  mongoose.model<IUser>(
    "User",
    userSchema,
  );