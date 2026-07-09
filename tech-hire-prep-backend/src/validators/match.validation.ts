import { z } from "zod";
import { interviewType } from "../types/match.types.ts";
import { ExperienceLevel, PreferredLanguage, TargetRole } from "../types/profile.types.ts";


export const matchRequestSchema = z.object({
  interviewType: z.enum(interviewType),
  preferredRole: z.enum(TargetRole),
  difficulty: z.enum(ExperienceLevel),
  preferredLanguage: z.enum(PreferredLanguage),
  duration: z.number().int().min(15).max(180),
  description: z.string().trim().max(2000).optional(),
});

export const availableSlotsQuerySchema = z.object({
  startDate: z.coerce.date(),

  endDate: z.coerce.date(),

  duration: z.coerce
    .number()
    .int()
    .min(15)
    .max(180)
    .default(60),
});

export type MatchRequestInput = z.infer<typeof matchRequestSchema>;

export type AvailableSlotsQuery = z.infer<
  typeof availableSlotsQuerySchema
>;