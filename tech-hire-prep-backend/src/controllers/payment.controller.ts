import {
  createOrderService,
  verifyPaymentService,
  handleWebhookService,
  getPaymentHistoryService,
  getPaymentDetailsService,
  subscribeService,
  cancelSubscriptionService,
  subscriptionStatusService,
} from "../services/payment.service.ts";
import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler.ts";
import { created, ok } from "../common/response.ts";

export const createOrderController = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const { sessionId, metadata } = req.body;

    const result = await createOrderService(userId, sessionId, metadata);

    return created(res, result, "Order created successfully");
  },
);

export const verifyPaymentController = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user!.id;

    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
      req.body;

    const result = await verifyPaymentService(
      userId,
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    );

    return ok(res, result, "Payment verified successfully");
  },
);

export const handleWebhookController = asyncHandler(
  async (req: Request, res: Response) => {
    const signature = req.headers["x-razorpay-signature"] as string;

    // SECURITY: Pass the raw body string for HMAC verification.
    // req.rawBody is captured by the express.json() verify callback in app.ts.
    const rawBody = req.rawBody;
    if (!rawBody) {
      throw new Error("Missing rawBody — cannot verify Razorpay signature");
    }

    const result = await handleWebhookService(rawBody, signature);

    return ok(res, result, "Webhook processed successfully");
  },
);

export const getPaymentHistoryController = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user!.id;

    const limit = Number(req.query.limit) || 10;

    const page = Number(req.query.page) || 1;

    const skip = (page - 1) * limit;

    const result = await getPaymentHistoryService(userId, limit, skip);

    return ok(res, result, "Payment history fetched successfully");
  },
);

export const getPaymentDetailsController = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user!.id;

    const { paymentId } = req.params;
    const result = await getPaymentDetailsService(userId, paymentId as string);

    return ok(res, result, "Payment details fetched successfully");
  },
);

export const subscribeController = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const { planId } = req.body;

    const result = await subscribeService(userId, planId);

    return ok(res, result, "Subscription started successfully");
  },
);

export const cancelSubscriptionController = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user!.id;

    const { subscriptionId } = req.body;
    const result = await cancelSubscriptionService(userId, subscriptionId);

    return ok(res, result, "Subscription cancelled successfully");
  },
);

export const subscriptionStatusController = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const result = await subscriptionStatusService(userId);

    return ok(res, result, "Subscription status fetched successfully");
  },
);
