import type { Types } from "mongoose";

/* -------------------------------------------------------------------------- */
/*                                   ENUMS                                    */
/* -------------------------------------------------------------------------- */

export enum UserRole {
  STUDENT = "STUDENT",
  ADMIN = "ADMIN",
  RECRUITER = "RECRUITER",
  INTERVIEWER = "INTERVIEWER",
}

export enum UserStatus {
  ACTIVE = "ACTIVE",
  SUSPENDED = "SUSPENDED",
  DELETED = "DELETED",
}

export enum Purpose {
  REGISTER = "REGISTER",
  LOGIN = "LOGIN",
  PASSWORD_CHANGE = "PASSWORD_CHANGE",
}

/* -------------------------------------------------------------------------- */
/*                               COMMON TYPES                                 */
/* -------------------------------------------------------------------------- */

export interface UserAvatar {
  s3Key: string;
  updatedAt: Date | null;
}

/* -------------------------------------------------------------------------- */
/*                              DATABASE ENTITY                               */
/* -------------------------------------------------------------------------- */

export interface IUser {
  _id?: Types.ObjectId;

  email: string;

  name: string;

  password: string;

  role: UserRole;

  status: UserStatus;

  isEmailVerified: boolean;

  avatarUrl: UserAvatar;

  emailVerifiedAt: Date | null;

  lastLoginAt?: Date;

  deletedAt?: Date | null;

  createdAt?: Date;

  updatedAt?: Date;
}



/* -------------------------------------------------------------------------- */
/*                              SERIALIZED USER                               */
/* -------------------------------------------------------------------------- */

export interface SerializedUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  avatarUrl: UserAvatar;
  emailVerifiedAt: Date | null;
}