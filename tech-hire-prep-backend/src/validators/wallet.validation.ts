import { z } from "zod";

export const walletMutationSchema = z.object({
  amount: z.number().positive(),
  description: z.string().optional(),
}).strict();
