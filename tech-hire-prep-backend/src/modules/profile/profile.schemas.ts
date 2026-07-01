import { z } from "zod";

export const availabilitySlotSchema = z.object({
  day: z.string().min(2).max(20),
  start: z.string().min(2).max(10),
  end: z.string().min(2).max(10),
  timezone: z.string().min(2).max(80),
});

export const preferencesSchema = z.object({
  interviewTypes: z.array(z.string().trim().min(1)).default([]),
  preferredLanguages: z.array(z.string().trim().min(1)).default([]),
  focusAreas: z.array(z.string().trim().min(1)).default([]),
});

export const verificationSchema = z.object({
  collegeName: z.string().trim().max(120).optional(),
  collegeEmail: z.email().optional(),
  githubUrl: z.url().optional(),
  linkedinUrl: z.url().optional(),
  resumeUrl: z.url().optional(),
});

export const profileUpdateSchema = z.object({
  headline: z.string().trim().max(120).optional(),
  bio: z.string().trim().max(600).optional(),
  targetRole: z.string().trim().max(80).optional(),
  skillTags: z.array(z.string().trim().min(1).max(40)).max(20).optional(),
  experienceLevel: z.number().min(0).max(15).optional(),
  availability: z.array(availabilitySlotSchema).max(21).optional(),
  preferences: preferencesSchema.optional(),
  verification: verificationSchema.optional(),
  college: z.string().trim().max(120).optional(),
  graduationYear: z.number().int().min(2000).max(2100).optional(),
});

export const avatarUpdateSchema = z.object({
  avatarUrl: z.url(),
});

export const preferencesUpdateSchema = z.object({
  preferences: preferencesSchema,
});

export const availabilityUpdateSchema = z.object({
  availability: z.array(availabilitySlotSchema).max(21),
});

export const userIdParamsSchema = z.object({
  userId: z.string().regex(/^[a-f\d]{24}$/i),
});

export const onboardingStepOneSchema = z.object({
  headline: z.string().trim().max(120).optional(),
  bio: z.string().trim().max(600).optional(),
  targetRole: z.string().trim().min(2).max(80),
  experienceLevel: z.number().min(0).max(15),
  college: z.string().trim().max(120).optional(),
  graduationYear: z.number().int().min(2000).max(2100).optional(),
});

export const onboardingStepTwoSchema = z.object({
  skillTags: z.array(z.string().trim().min(1).max(40)).min(1).max(20),
  preferences: preferencesSchema,
});

export const onboardingStepThreeSchema = z.object({
  availability: z.array(availabilitySlotSchema).min(1).max(21),
  verification: verificationSchema,
});
