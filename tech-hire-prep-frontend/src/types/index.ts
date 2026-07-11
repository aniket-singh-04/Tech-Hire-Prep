
export interface AvailabilitySlot {
  day: string;
  start: string;
  end: string;
  timezone: string;
}

export interface ProfilePreferences {
  interviewTypes: string[];
  preferredLanguages: string[];
  focusAreas: string[];
}

export interface ProfileVerification {
  collegeName?: string;
  collegeEmail?: string;
  githubUrl?: string;
  linkedinUrl?: string;
  resumeUrl?: string;
}

export interface Profile {
  userId: string;
  headline?: string;
  bio?: string;
  targetRole?: string;
  skillTags: string[];
  experienceLevel?: number;
  availability: AvailabilitySlot[];
  preferences: ProfilePreferences;
  verification: ProfileVerification;
  college?: string;
  graduationYear?: number;
  completionScore: number;
  onboardingStep: number;
  onboardingCompleted: boolean;
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
  rating: number;
  rubric: FeedbackRubric;
  strengths: string[];
  improvements: string[];
  summary?: string;
  recommendation?: FeedbackRecommendation;
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
