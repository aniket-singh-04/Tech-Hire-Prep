// src/types/feedback.ts

export type Rating = 1 | 2 | 3 | 4 | 5;

export type Difficulty = "easy" | "medium" | "hard";

export type Recommendation =
  | "strongly_recommend"
  | "recommend"
  | "neutral"
  | "not_recommend"
  | "strongly_not_recommend";

export type RecommendationAgain =
  | "definitely_yes"
  | "probably_yes"
  | "maybe"
  | "probably_no"
  | "definitely_no";

export interface TechnicalRatings {
  problemSolving: Rating;
  dsa: Rating;
  backend: Rating;
  frontend: Rating;
  database: Rating;
  systemDesign: Rating;
  oop: Rating;
  computerFundamentals: Rating;
  coding: Rating;
  debugging: Rating;
  codeQuality: Rating;
  optimization: Rating;
}

export interface CommunicationRatings {
  communication: Rating;
  confidence: Rating;
  explanation: Rating;
  listening: Rating;
  professionalism: Rating;
  timeManagement: Rating;
  collaboration: Rating;
  questionAsking: Rating;
  responseClarity: Rating;
  thinkingProcess: Rating;
}

export interface SoftSkillRatings {
  leadership: Rating;
  collaboration: Rating;
  positiveAttitude: Rating;
  adaptability: Rating;
  criticalThinking: Rating;
  creativity: Rating;
  decisionMaking: Rating;
  learningAbility: Rating;
}

export interface InterviewFlow {
  startedOnTime: boolean;
  completedInterview: boolean;
  relevantQuestions: boolean;
  followUpQuestions: boolean;
  listenedCarefully: boolean;
  enoughThinkingTime: boolean;
  gaveHints: boolean;
  professionalismMaintained: boolean;
  respectedDuration: boolean;
  explainedMistakes: boolean;
}

export interface CodingEvaluation {
  understoodProblem:
    | "excellent"
    | "good"
    | "average"
    | "poor";

  askedClarifyingQuestions: boolean;

  explainedApproach: boolean;

  workingSolution:
    | "yes"
    | "partial"
    | "no";

  edgeCases:
    | "excellent"
    | "average"
    | "poor";

  codeReadability: Rating;

  variableNaming: Rating;

  complexityAnalysis: Rating;

  testingApproach: Rating;
}

export interface WrittenFeedback {
  impressed: string;

  improvements: string;

  advice: string;

  additionalComments: string;
}

export interface ReportIssue {
  reported: boolean;

  reasons: string[];

  description: string;
}

export interface PublicReview {
  visibility:
    | "public"
    | "anonymous"
    | "private";
}

export interface FeedbackFormValues {
  overallRating: Rating;

  interviewAgain: RecommendationAgain;

  interviewDifficulty: Difficulty;

  interviewerProfessional:
    | "yes"
    | "somewhat"
    | "no";

  technical: TechnicalRatings;

  communication: CommunicationRatings;

  interviewTopics: string[];

  interviewFlow: InterviewFlow;

  strengths: string[];

  improvements: string[];

  codingEvaluation: CodingEvaluation;

  softSkills: SoftSkillRatings;

  writtenFeedback: WrittenFeedback;

  report: ReportIssue;

  publicReview: PublicReview;

  overallRecommendation: Recommendation;

  agreeTerms: boolean;
}