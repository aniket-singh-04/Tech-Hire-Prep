import { Types } from "mongoose";
import { ExperienceLevel, PreferredLanguage, TargetRole } from "./profile.types.ts";

export enum interviewType {
  TECHNICAL = "TECHNICAL",
  DSA = "DSA",
  SYSTEM_DESIGN = "SYSTEM_DESIGN",
  HR = "HR",
  BEHAVIORAL = "BEHAVIORAL"
}

export enum matchStatus {
  SEARCHING = "SEARCHING",
  MATCHED = "MATCHED",
  CANCELLED = "CANCELLED",
  EXPIRED = "EXPIRED"
}

export interface IInterview {
  userId: Types.ObjectId;
  interviewType: interviewType,
  preferredRole: TargetRole,
  difficulty: ExperienceLevel,
  preferredLanguage: PreferredLanguage,
  duration: number,
  status: matchStatus
  matchedUserId: Types.ObjectId,
  interviewSessionId: Types.ObjectId
}

interface MatchRequestInput {
  interviewType: interviewType,
  preferredRole: TargetRole,
  difficulty: ExperienceLevel,
  preferredLanguage: PreferredLanguage,
  duration: number,
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