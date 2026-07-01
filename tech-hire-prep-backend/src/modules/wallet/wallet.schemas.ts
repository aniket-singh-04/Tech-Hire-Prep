import { z } from "zod";

export const walletMutationSchema = z.object({
  amount: z.number().int().positive(),
  reason: z.string().trim().min(2).max(120),
});
