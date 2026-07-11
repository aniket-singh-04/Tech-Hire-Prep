// src/schemas/feedback.schema.ts

import { z } from "zod";

const ratingSchema = z
  .string()
  .min(1, "Rating is required")
  .transform((val) => Number(val))
  .refine((val) => val >= 1 && val <= 5, {
    message: "Rating must be between 1 and 5",
  });

export const feedbackSchema = z.object({
  // ===========================
  // Overall
  // ===========================

  overallRating: ratingSchema,

  interviewAgain: z.enum([
    "definitely_yes",
    "probably_yes",
    "maybe",
    "probably_no",
    "definitely_no",
  ]),

  interviewDifficulty: z.enum([
    "easy",
    "medium",
    "hard",
  ]),

  interviewerProfessional: z.enum([
    "yes",
    "somewhat",
    "no",
  ]),

  // ===========================
  // Technical
  // ===========================

  technical: z.object({
    problemSolving: ratingSchema,
    dsa: ratingSchema,
    backend: ratingSchema,
    frontend: ratingSchema,
    database: ratingSchema,
    systemDesign: ratingSchema,
    oop: ratingSchema,
    computerFundamentals: ratingSchema,
    coding: ratingSchema,
    debugging: ratingSchema,
    codeQuality: ratingSchema,
    optimization: ratingSchema,
  }),

  // ===========================
  // Communication
  // ===========================

  communication: z.object({
    communication: ratingSchema,
    confidence: ratingSchema,
    explanation: ratingSchema,
    listening: ratingSchema,
    professionalism: ratingSchema,
    timeManagement: ratingSchema,
    collaboration: ratingSchema,
    questionAsking: ratingSchema,
    responseClarity: ratingSchema,
    thinkingProcess: ratingSchema,
  }),

  // ===========================
  // Interview Topics
  // ===========================

  interviewTopics: z
    .array(z.string())
    .min(1, "Select at least one topic"),

  // ===========================
  // Interview Flow
  // ===========================

  interviewFlow: z.object({
    startedOnTime: z.boolean(),
    completedInterview: z.boolean(),
    relevantQuestions: z.boolean(),
    followUpQuestions: z.boolean(),
    listenedCarefully: z.boolean(),
    enoughThinkingTime: z.boolean(),
    gaveHints: z.boolean(),
    professionalismMaintained: z.boolean(),
    respectedDuration: z.boolean(),
    explainedMistakes: z.boolean(),
  }),

  // ===========================
  // Strengths
  // ===========================

  strengths: z
    .array(z.string())
    .min(1, "Select at least one strength"),

  // ===========================
  // Improvements
  // ===========================

  improvements: z
    .array(z.string())
    .min(1, "Select at least one improvement"),

  // ===========================
  // Coding Evaluation
  // ===========================

  codingEvaluation: z.object({
    understoodProblem: z.enum([
      "excellent",
      "good",
      "average",
      "poor",
    ]),

    askedClarifyingQuestions: z.boolean(),

    explainedApproach: z.boolean(),

    workingSolution: z.enum([
      "yes",
      "partial",
      "no",
    ]),

    edgeCases: z.enum([
      "excellent",
      "average",
      "poor",
    ]),

    codeReadability: ratingSchema,
    variableNaming: ratingSchema,
    complexityAnalysis: ratingSchema,
    testingApproach: ratingSchema,
  }),

  // ===========================
  // Soft Skills
  // ===========================

  softSkills: z.object({
    leadership: ratingSchema,
    collaboration: ratingSchema,
    positiveAttitude: ratingSchema,
    adaptability: ratingSchema,
    criticalThinking: ratingSchema,
    creativity: ratingSchema,
    decisionMaking: ratingSchema,
    learningAbility: ratingSchema,
  }),

  // ===========================
  // Written Feedback
  // ===========================

  writtenFeedback: z.object({
    impressed: z
      .string()
      .trim()
      .min(20, "Minimum 20 characters")
      .max(500),

    improvements: z
      .string()
      .trim()
      .min(20, "Minimum 20 characters")
      .max(500),

    advice: z
      .string()
      .trim()
      .min(20, "Minimum 20 characters")
      .max(500),

    additionalComments: z
      .string()
      .trim()
      .max(1000)
      .optional()
      .or(z.literal("")),
  }),

  // ===========================
  // Report
  // ===========================

  report: z.object({
    reported: z.boolean(),

    reasons: z.array(z.string()),

    description: z
      .string()
      .max(500)
      .optional()
      .or(z.literal("")),
  }),

  // ===========================
  // Review Visibility
  // ===========================

  publicReview: z.object({
    visibility: z.enum([
      "public",
      "anonymous",
      "private",
    ]),
  }),

  // ===========================
  // Final Recommendation
  // ===========================

  overallRecommendation: z.enum([
    "strongly_recommend",
    "recommend",
    "neutral",
    "not_recommend",
    "strongly_not_recommend",
  ]),

  // ===========================
  // Terms
  // ===========================

agreeTerms: z.literal(true, {
  message: "You must confirm before submitting.",
}),
});

export type FeedbackSchema = z.infer<
  typeof feedbackSchema
>;