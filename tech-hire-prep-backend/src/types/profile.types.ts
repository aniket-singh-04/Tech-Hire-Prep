import { Types } from "mongoose";

/* ===========================
   ENUMS
=========================== */

export enum ExperienceLevel {
  BEGINNER = "0",
  ENTRY_LEVEL = "1-2",
  INTERMEDIATE = "1-3",
  ADVANCED = "Above-3",
}

export enum TargetRole {
  FRONTEND = "FRONTEND",
  BACKEND = "BACKEND",
  FULLSTACK = "FULLSTACK",
  AI_ENGINEER = "AI_ENGINEER",
  DEVOPS = "DEVOPS",
  AI_ML = "AI_ML",
  DATA_SCIENCE = "DATA_SCIENCE",
  MOBILE_DEVELOPMENT = "MOBILE_DEVELOPMENT",
  QA = "QA",
  PRODUCT_MANAGEMENT = "PRODUCT_MANAGEMENT",
  OTHER = "OTHER",
}

export enum PreferredLanguage {
  ENGLISH = "ENGLISH",
  HINDI = "HINDI",
}

export enum WeekDay {
  MONDAY = "MONDAY",
  TUESDAY = "TUESDAY",
  WEDNESDAY = "WEDNESDAY",
  THURSDAY = "THURSDAY",
  FRIDAY = "FRIDAY",
  SATURDAY = "SATURDAY",
  SUNDAY = "SUNDAY",
  ALL_WORKING_DAYS = "ALL_WORKING_DAYS",
  ALL = "24*7"
}

/* ===========================
   SUB DOCUMENTS
=========================== */

export interface ISocialLinks {
  github?: string;
  linkedin?: string;
  portfolio?: string;
  leetcode?: string;
  codeforces?: string;
  codechef?: string;
  geeksforgeeks?: string;
  hackerEarth?: string;
  hackerRank?: string;
}

export interface INotificationPreference {
  email: boolean;
}

export interface IPreferences {
  language: PreferredLanguage;
  notifications: INotificationPreference;
}

export interface IAvailabilitySlot {
  day: WeekDay;
  startTime: string;
  endTime: string;
}

/* ===========================
   PROFILE
=========================== */

export interface IProfile {
  userId: Types.ObjectId;
  username: string;
  headline?: string;
  bio?: string;
  college?: string;
  branch?: string;
  graduationYear?: number;
  targetRole: TargetRole;
  experienceLevel: ExperienceLevel;
  skills: string[];
  socialLinks: ISocialLinks;
  preferences: IPreferences;
  availability: IAvailabilitySlot[];
  profileCompletion: number;
  isProfileCompleted: boolean;
}
