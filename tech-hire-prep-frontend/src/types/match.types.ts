import type { ExperienceLevel, PreferredLanguage, TargetRole } from ".";

export const interviewType = {
  TECHNICAL : "TECHNICAL",
  DSA : "DSA",
  SYSTEM_DESIGN : "SYSTEM_DESIGN",
  HR : "HR",
  PROJECT_PROBLEM : "PROJECT_PROBLEM",
  BEHAVIORAL : "BEHAVIORAL"
} as const ;

export type interviewType = typeof interviewType[keyof typeof interviewType];

export interface MatchRequestInput {
  interviewType: interviewType,
  preferredRole: TargetRole,
  difficulty: ExperienceLevel,
  preferredLanguage: PreferredLanguage,
  duration: number,
  description?: string;
}