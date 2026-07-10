import { z } from "zod";

export const createOrderSchema = z.object({
  /** Link this payment to a specific interview session */
  sessionId: z
    .string()
    .regex(/^[0-9a-fA-F]{24}$/, "Invalid session ID")
    .optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
}).strict();

export const verifyPaymentSchema = z.object({
  razorpay_order_id: z.string().min(1, "Order ID is required"),
  razorpay_payment_id: z.string().min(1, "Payment ID is required"),
  razorpay_signature: z.string().min(1, "Signature is required"),
}).strict();

export const subscribeSchema = z.object({
  planId: z.string().min(1, "Plan ID is required"),
}).strict();

export const cancelSubscriptionSchema = z.object({
  subscriptionId: z.string().min(1, "Subscription ID is required"),
}).strict();

export const paymentHistoryQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).default(10),
  page: z.coerce.number().int().min(1).default(1),
});

export const paymentIdParamsSchema = z.object({
  paymentId: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid Mongo ID format for payment"),
}).strict();
