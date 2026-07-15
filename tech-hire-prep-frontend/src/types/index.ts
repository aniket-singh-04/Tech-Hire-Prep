
export const ExperienceLevel = {
  BEGINNER: "0",
  ENTRY_LEVEL: "1-2",
  INTERMEDIATE: "1-3",
  ADVANCED: "Above-3",
} as const;

export type ExperienceLevel =
  typeof ExperienceLevel[keyof typeof ExperienceLevel];


export const TargetRole = {
  FRONTEND: "FRONTEND",
  BACKEND: "BACKEND",
  FULLSTACK: "FULLSTACK",
  AI_ENGINEER: "AI_ENGINEER",
  DEVOPS: "DEVOPS",
  AI_ML: "AI_ML",
  DATA_SCIENCE: "DATA_SCIENCE",
  MOBILE_DEVELOPMENT: "MOBILE_DEVELOPMENT",
  QA: "QA",
  PRODUCT_MANAGEMENT: "PRODUCT_MANAGEMENT",
  OTHER: "OTHER",
} as const;

export type TargetRole =
  typeof TargetRole[keyof typeof TargetRole];


export const PreferredLanguage = {
  ENGLISH: "ENGLISH",
  HINDI: "HINDI",
} as const;

export type PreferredLanguage =
  typeof PreferredLanguage[keyof typeof PreferredLanguage];


export const WeekDay = {
  MONDAY: "MONDAY",
  TUESDAY: "TUESDAY",
  WEDNESDAY: "WEDNESDAY",
  THURSDAY: "THURSDAY",
  FRIDAY: "FRIDAY",
  SATURDAY: "SATURDAY",
  SUNDAY: "SUNDAY",
  ALL_WORKING_DAYS: "ALL_WORKING_DAYS",
  ALL: "24*7",
} as const;

export type WeekDay =
  typeof WeekDay[keyof typeof WeekDay];

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

export interface Profile {
  userId: string;
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

export interface OnboardingStatus {
  step: number;
  completionScore: number;
  completed: boolean;
  missing: string[];
}

// ─── Interview Request ────────────────────────────────────────────────────────
export type InterviewRequestStatus = 'pending' | 'matched' | 'cancelled' | 'expired';

export interface InterviewRequest {
  requestId: string;
  status: InterviewRequestStatus | 'idle' | 'queued';
  sessionId?: string;
  expiresAt?: string;
  requesterId?: string;
  requesterName?: string;
  interviewType?: string;
  preferredRole?: string;
  difficulty?: string;
  preferredLanguage?: string;
  duration?: number;
  description?: string;
  requesterHeadline?: string;
}

// ─── Interview Session ────────────────────────────────────────────────────────
export type SessionStatus = 'pending' | 'matched' | 'scheduled' | 'live' | 'completed' | 'cancelled';
export type SessionParticipantRole = 'candidate' | 'interviewer';

export interface SessionParticipant {
  userId: string;
  role: SessionParticipantRole;
  joinedAt?: string;
  leftAt?: string;
  feedbackSubmitted: boolean;
}

export interface SessionScorecard {
  overallScore: number;
  rubric: {
    communication: number;
    problemSolving: number;
    technicalDepth: number;
    clarity: number;
    collaboration: number;
    timeManagement: number;
  };
  strengths: string[];
  improvements: string[];
  generatedAt: string;
}

export interface SessionEditor {
  language: string;
  code: string;
  version: number;
  lastUpdatedBy?: string;
  lastUpdatedAt?: string;
}

export interface Session {
  id: string;
  requestIds: string[];
  participants: SessionParticipant[];
  status: SessionStatus;
  scheduledAt?: string;
  startedAt?: string;
  endedAt?: string;
  roomId: string;
  editor: SessionEditor;
  scorecard?: SessionScorecard;
  reports: Array<{ userId: string; reason: string; createdAt: string }>;
  ratingSummary: { averageRating: number; count: number };
}

// ─── Feedback ─────────────────────────────────────────────────────────────────
export type FeedbackRecommendation = 'strong_hire' | 'hire' | 'mixed' | 'no_hire';

export interface FeedbackRubric {
  communication: number;
  problemSolving: number;
  technicalDepth: number;
  clarity: number;
  collaboration: number;
  timeManagement: number;
}

export interface FeedbackPayload {
  feedback: string;
}

// ─── Wallet ───────────────────────────────────────────────────────────────────
export type PointTransactionType = 'earn' | 'spend' | 'redeem' | 'adjustment';

export interface PointTransaction {
  id: string;
  sessionId?: string;
  type: PointTransactionType;
  reason: string;
  amount: number;
  metadata?: Record<string, unknown>;
  createdAt: string;
}

export interface WalletLedger {
  balance: number;
  transactions: PointTransaction[];
}

// ─── Editor Template ─────────────────────────────────────────────────────────
export interface EditorTemplate {
  id: string;
  language: string;
  name: string;
  code: string;
}

// ─── API Response ─────────────────────────────────────────────────────────────
export interface ApiResponse<T = unknown> {
  success: boolean;
  data: T;
  message?: string;
}

