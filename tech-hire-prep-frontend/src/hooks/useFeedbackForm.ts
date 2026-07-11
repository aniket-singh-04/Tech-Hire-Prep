// src/hooks/useFeedbackForm.ts

import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { feedbackSchema, type FeedbackSchema } from "../schema/feedback.schema";


const STORAGE_KEY = "feedback-form";

const defaultValues: FeedbackSchema = {
  // ----------------------------------
  // Overall
  // ----------------------------------

  overallRating: 5,

  interviewAgain: "definitely_yes",

  interviewDifficulty: "medium",

  interviewerProfessional: "yes",

  // ----------------------------------
  // Technical
  // ----------------------------------

  technical: {
    problemSolving: 5,
    dsa: 5,
    backend: 5,
    frontend: 5,
    database: 5,
    systemDesign: 5,
    oop: 5,
    computerFundamentals: 5,
    coding: 5,
    debugging: 5,
    codeQuality: 5,
    optimization: 5,
  },

  // ----------------------------------
  // Communication
  // ----------------------------------

  communication: {
    communication: 5,
    confidence: 5,
    explanation: 5,
    listening: 5,
    professionalism: 5,
    timeManagement: 5,
    collaboration: 5,
    questionAsking: 5,
    responseClarity: 5,
    thinkingProcess: 5,
  },

  // ----------------------------------

  interviewTopics: [],

  // ----------------------------------
  // Interview Flow
  // ----------------------------------

  interviewFlow: {
    startedOnTime: false,
    completedInterview: false,
    relevantQuestions: false,
    followUpQuestions: false,
    listenedCarefully: false,
    enoughThinkingTime: false,
    gaveHints: false,
    professionalismMaintained: false,
    respectedDuration: false,
    explainedMistakes: false,
  },

  // ----------------------------------

  strengths: [],

  improvements: [],

  // ----------------------------------
  // Coding
  // ----------------------------------

  codingEvaluation: {
    understoodProblem: "good",

    askedClarifyingQuestions: false,

    explainedApproach: false,

    workingSolution: "partial",

    edgeCases: "average",

    codeReadability: 5,

    variableNaming: 5,

    complexityAnalysis: 5,

    testingApproach: 5,
  },

  // ----------------------------------
  // Soft Skills
  // ----------------------------------

  softSkills: {
    leadership: 5,
    collaboration: 5,
    positiveAttitude: 5,
    adaptability: 5,
    criticalThinking: 5,
    creativity: 5,
    decisionMaking: 5,
    learningAbility: 5,
  },

  // ----------------------------------
  // Written Feedback
  // ----------------------------------

  writtenFeedback: {
    impressed: "",

    improvements: "",

    advice: "",

    additionalComments: "",
  },

  // ----------------------------------
  // Report
  // ----------------------------------

  report: {
    reported: false,

    reasons: [],

    description: "",
  },

  // ----------------------------------

  publicReview: {
    visibility: "public",
  },

  // ----------------------------------

  overallRecommendation: "recommend",

  // agreeTerms: false,
};

export const TOTAL_STEPS = 8;

export function useFeedbackForm() {
  const [step, setStep] = useState(1);

  const form = useForm<FeedbackSchema>({
    resolver: zodResolver(feedbackSchema),
    defaultValues,
    mode: "onChange",
  });

  // --------------------------------------
  // Restore saved form
  // --------------------------------------

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);

    if (!saved) return;

    try {
      const parsed: FeedbackSchema = JSON.parse(saved);

      form.reset(parsed);
    } catch {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, [form]);

  // --------------------------------------
  // Auto Save
  // --------------------------------------

  useEffect(() => {
    const subscription = form.watch((values) => {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(values)
      );
    });

    return () => subscription.unsubscribe();
  }, [form]);

  // --------------------------------------
  // Navigation
  // --------------------------------------

  const nextStep = () => {
    setStep((prev) =>
      Math.min(prev + 1, TOTAL_STEPS)
    );
  };

  const previousStep = () => {
    setStep((prev) =>
      Math.max(prev - 1, 1)
    );
  };

  const goToStep = (value: number) => {
    if (value < 1 || value > TOTAL_STEPS) return;

    setStep(value);
  };

  // --------------------------------------

  const progress = useMemo(() => {
    return Math.round(
      (step / TOTAL_STEPS) * 100
    );
  }, [step]);

  // --------------------------------------

  const resetForm = () => {
    localStorage.removeItem(STORAGE_KEY);

    form.reset(defaultValues);

    setStep(1);
  };

  // --------------------------------------

  const onSubmit = async (
    data: FeedbackSchema
  ) => {
    console.log(data);

    /*
        await axios.post(
            "/api/v1/sessions/:id/feedback",
            data
        );
        */

    localStorage.removeItem(STORAGE_KEY);
  };

  // --------------------------------------

  return {
    form,

    step,

    progress,

    totalSteps: TOTAL_STEPS,

    isFirstStep: step === 1,

    isLastStep: step === TOTAL_STEPS,

    nextStep,

    previousStep,

    goToStep,

    resetForm,

    handleSubmit:
      form.handleSubmit(onSubmit),
  };
}