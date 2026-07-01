import { z } from "zod";
import { availabilitySlotSchema } from "../profile/profile.schemas.js";

export const matchRequestSchema = z.object({
  targetRole: z.string().trim().min(2).max(80).optional(),
  skillTags: z.array(z.string().trim().min(1).max(40)).max(20).optional(),
  experienceLevel: z.number().min(0).max(15).optional(),
  availability: z.array(availabilitySlotSchema).max(21).optional(),
  notes: z.string().trim().max(300).optional(),
});
