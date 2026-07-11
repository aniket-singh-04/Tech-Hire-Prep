// src/constants/feedback.constants.ts

import type { Difficulty, Recommendation, RecommendationAgain } from "../types/feedback";


export const DIFFICULTY_OPTIONS: {
  label: string;
  value: Difficulty;
}[] = [
  {
    label: "Easy",
    value: "easy",
  },
  {
    label: "Medium",
    value: "medium",
  },
  {
    label: "Hard",
    value: "hard",
  },
];

export const INTERVIEW_AGAIN_OPTIONS: {
  label: string;
  value: RecommendationAgain;
}[] = [
  {
    label: "Definitely Yes",
    value: "definitely_yes",
  },
  {
    label: "Probably Yes",
    value: "probably_yes",
  },
  {
    label: "Maybe",
    value: "maybe",
  },
  {
    label: "Probably No",
    value: "probably_no",
  },
  {
    label: "Definitely No",
    value: "definitely_no",
  },
];

export const PROFESSIONAL_OPTIONS = [
  {
    label: "Yes",
    value: "yes",
  },
  {
    label: "Somewhat",
    value: "somewhat",
  },
  {
    label: "No",
    value: "no",
  },
];

export const RECOMMENDATION_OPTIONS: {
  label: string;
  value: Recommendation;
}[] = [
  {
    label: "Strongly Recommend",
    value: "strongly_recommend",
  },
  {
    label: "Recommend",
    value: "recommend",
  },
  {
    label: "Neutral",
    value: "neutral",
  },
  {
    label: "Not Recommend",
    value: "not_recommend",
  },
  {
    label: "Strongly Not Recommend",
    value: "strongly_not_recommend",
  },
];

export const TECHNICAL_FIELDS = [
  {
    key: "problemSolving",
    label: "Problem Solving",
  },
  {
    key: "dsa",
    label: "DSA",
  },
  {
    key: "backend",
    label: "Backend",
  },
  {
    key: "frontend",
    label: "Frontend",
  },
  {
    key: "database",
    label: "Database",
  },
  {
    key: "systemDesign",
    label: "System Design",
  },
  {
    key: "oop",
    label: "Object Oriented Programming",
  },
  {
    key: "computerFundamentals",
    label: "Computer Fundamentals",
  },
  {
    key: "coding",
    label: "Coding",
  },
  {
    key: "debugging",
    label: "Debugging",
  },
  {
    key: "codeQuality",
    label: "Code Quality",
  },
  {
    key: "optimization",
    label: "Optimization",
  },
] as const;

export const COMMUNICATION_FIELDS = [
  {
    key: "communication",
    label: "Communication",
  },
  {
    key: "confidence",
    label: "Confidence",
  },
  {
    key: "explanation",
    label: "Explanation",
  },
  {
    key: "listening",
    label: "Listening",
  },
  {
    key: "professionalism",
    label: "Professionalism",
  },
  {
    key: "timeManagement",
    label: "Time Management",
  },
  {
    key: "collaboration",
    label: "Collaboration",
  },
  {
    key: "questionAsking",
    label: "Question Asking",
  },
  {
    key: "responseClarity",
    label: "Response Clarity",
  },
  {
    key: "thinkingProcess",
    label: "Thinking Process",
  },
] as const;

export const SOFT_SKILLS = [
  {
    key: "leadership",
    label: "Leadership",
  },
  {
    key: "collaboration",
    label: "Collaboration",
  },
  {
    key: "positiveAttitude",
    label: "Positive Attitude",
  },
  {
    key: "adaptability",
    label: "Adaptability",
  },
  {
    key: "criticalThinking",
    label: "Critical Thinking",
  },
  {
    key: "creativity",
    label: "Creativity",
  },
  {
    key: "decisionMaking",
    label: "Decision Making",
  },
  {
    key: "learningAbility",
    label: "Learning Ability",
  },
] as const;

export const INTERVIEW_TOPICS = [
  "Resume Discussion",
  "HR Round",
  "DSA",
  "Low Level Design",
  "High Level Design",
  "Backend",
  "Frontend",
  "Database",
  "Java",
  "JavaScript",
  "TypeScript",
  "React",
  "Node.js",
  "Express",
  "MongoDB",
  "SQL",
  "REST API",
  "GraphQL",
  "Authentication",
  "Redis",
  "AWS",
  "Docker",
  "Kubernetes",
  "DevOps",
  "CI/CD",
  "System Design",
  "OOP",
  "Operating System",
  "Computer Networks",
  "Behavioral Questions",
  "Coding Round",
  "Live Debugging",
  "Project Discussion",
];

export const STRENGTH_OPTIONS = [
  "Problem Solving",
  "Strong DSA",
  "Strong Backend",
  "Strong Frontend",
  "Database Knowledge",
  "System Design",
  "Clean Code",
  "Debugging",
  "Communication",
  "Leadership",
  "Confidence",
  "Project Knowledge",
  "API Design",
  "SQL",
  "Time Management",
  "Team Player",
  "Professionalism",
  "Quick Learner",
];

export const IMPROVEMENT_OPTIONS = [
  "Problem Solving",
  "DSA",
  "Backend",
  "Frontend",
  "Database",
  "System Design",
  "Communication",
  "Confidence",
  "Coding Speed",
  "Code Quality",
  "Debugging",
  "Edge Cases",
  "API Design",
  "Java",
  "JavaScript",
  "TypeScript",
  "React",
  "Node.js",
  "MongoDB",
  "SQL",
  "AWS",
  "Docker",
  "DevOps",
  "Time Management",
];

export const REPORT_REASONS = [
  "Toxic Behaviour",
  "Abusive Language",
  "Spam",
  "Fake Interview",
  "No Show",
  "Harassment",
  "Cheating",
  "Recording Without Permission",
  "Asked Personal Questions",
  "Offensive Content",
  "Other",
];

export const CODING_RESULT_OPTIONS = [
  {
    label: "Excellent",
    value: "excellent",
  },
  {
    label: "Good",
    value: "good",
  },
  {
    label: "Average",
    value: "average",
  },
  {
    label: "Poor",
    value: "poor",
  },
];

export const WORKING_SOLUTION_OPTIONS = [
  {
    label: "Yes",
    value: "yes",
  },
  {
    label: "Partial",
    value: "partial",
  },
  {
    label: "No",
    value: "no",
  },
];

export const REVIEW_VISIBILITY = [
  {
    label: "Public",
    value: "public",
  },
  {
    label: "Anonymous",
    value: "anonymous",
  },
  {
    label: "Private",
    value: "private",
  },
];

export const FEEDBACK_STEPS = [
  "Overall",
  "Technical",
  "Communication",
  "Interview Flow",
  "Coding",
  "Strengths",
  "Comments",
  "Review",
];