import { Types } from "mongoose";
import { ExperienceLevel, PreferredLanguage, TargetRole } from "./profile.types.ts";

export enum interviewType {
  TECHNICAL = "TECHNICAL",
  DSA = "DSA",
  SYSTEM_DESIGN = "SYSTEM_DESIGN",
  HR = "HR",
  PROJECT_PROBLEM = "PROJECT_PROBLEM",
  BEHAVIORAL = "BEHAVIORAL"
}

export enum matchStatus {
  SEARCHING = "SEARCHING",
  MATCHED = "MATCHED",
  ACCEPTED = "ACCEPTED",
  COMPLETED = "COMPLETED",
  CANCELLED = "CANCELLED",
  EXPIRED = "EXPIRED"
}

export enum notifiedUserStatus{
  PENDING = "PENDING",
  ACCEPTED = "ACCEPTED",
  REJECTED = "REJECTED"
}

export interface IInterview {
  userId: Types.ObjectId;
  interviewType: interviewType,
  preferredRole: TargetRole,
  difficulty: ExperienceLevel,
  preferredLanguage: PreferredLanguage,
  duration: number,
  description?: string;
  status: matchStatus;
  matchedUserId?: Types.ObjectId;
  interviewSessionId?: Types.ObjectId;

  acceptedTime?: Date;
  expirationTimestamp: Date;

  // First-Accept Wins Tracking
  notifiedUsers?: Array<{
    userId: Types.ObjectId;
    status: notifiedUserStatus;
    notifiedAt: Date;
    respondedAt?: Date;
  }>;
}

interface MatchRequestInput {
  interviewType: interviewType,
  preferredRole: TargetRole,
  difficulty: ExperienceLevel,
  preferredLanguage: PreferredLanguage,
  duration: number,
  description?: string;
}

export interface RequestMatchServiceInput {
  userId: string;
  data: MatchRequestInput;
}

// export interface QueueStatusServiceInput {
//   userId: string;
// }

// export interface CancelMatchServiceInput {
//   userId: string;
// }

// export interface AvailableSlotsServiceInput {
//   userId: string;
//   query: AvailableSlotsQuery;
// }

// export interface QueueStatusResponse {
//   status: matchStatus;
//   queuePosition?: number;
//   estimatedWait?: number;
//   sessionId?: string;
// }

// export interface TimeSlot {
//   startTime: Date;
//   endTime: Date;
//   available: boolean;
// }

// export interface AvailableSlotsResponse {
//   date: string;
//   slots: TimeSlot[];
// }