import Razorpay from "razorpay";
import crypto from "crypto";
import { Types } from "mongoose";
import { PAYMENT_CONSTANTS } from "../constants/payment.constants.ts";
import { PaymentRepository } from "../repositories/payment.repository.ts";
import { Currency, PaymentGateway, PaymentStatus } from "../types/payment.types.ts";
import { AppError } from "../utils/appError.ts";
import { ENV } from "../config/envConfig.ts";
import { InterviewSessionStatus } from "../models/interviewSession.model.ts";
import interviewSessionRepository from "../repositories/interviewSession.repository.ts";

const razorpay = new Razorpay({
  key_id: ENV.RAZORPAY_KEY_ID || "",
  key_secret: ENV.RAZORPAY_KEY_SECRET || "",
});

const promoteSessionAfterPayment = async (payment: any) => {
  const sessionId = payment?.metadata?.sessionId;
  if (!sessionId) return;

  const session = await interviewSessionRepository.findById(sessionId);
  if (!session) return;
  if ([InterviewSessionStatus.COMPLETED, InterviewSessionStatus.CANCELLED].includes(session.status)) return;

  if (session.status === InterviewSessionStatus.CREATED || session.status === InterviewSessionStatus.SCHEDULED) {
    await interviewSessionRepository.updateSessionStatus(new Types.ObjectId(sessionId), {status: InterviewSessionStatus.READY, readyAt: session.readyAt ?? new Date()});
  }
};

export const createOrderService = async (
  userId: string,
  sessionId?: string,
  metadata?: Record<string, unknown>
) => {
  const amountInPaise = Math.round(PAYMENT_CONSTANTS.INTERVIEW_COST_INR * 100);
  const receiptId = `r_${userId.slice(0, 8)}_${Date.now()}`;

  try {
    if (sessionId) {
      const existing = await PaymentRepository.findActiveByUserAndSession(userId, sessionId);
      if (existing) {
        return {
          orderId: existing.orderId,
          amount: existing.amount * 100,
          currency: existing.currency,
          paymentId: existing._id,
          status: existing.status,
        };
      }
    }

    const order = await razorpay.orders.create({
      amount: amountInPaise,
      currency: PAYMENT_CONSTANTS.CURRENCY_INR,
      receipt: receiptId,
    });
    console.log(order)

    // Merge sessionId into metadata so we can link payment ? session later
    const resolvedMetadata: Record<string, unknown> = {
      ...metadata,
      ...(sessionId ? { sessionId } : {}),
    };

    const payment = await PaymentRepository.create({
      orderId: order.id,
      amount: PAYMENT_CONSTANTS.INTERVIEW_COST_INR,
      currency: Currency.INR,
      receipt: receiptId,
      status: PaymentStatus.CREATED,
      gateway: PaymentGateway.RAZORPAY,
      userId: new Types.ObjectId(userId),
      metadata: resolvedMetadata,
    });

    return {
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      paymentId: payment._id,
      status: payment.status,
    };
  } catch (error: any) {
      console.error("Create Razorpay order error:", error);
  console.error("Response:", error?.response);
  console.error("Response data:", error?.response?.data);
    throw new AppError(`Failed to create Razorpay order: ${error.message}`, 500);
  }
};


export const verifyPaymentService = async (
  userId: string,
  razorpayOrderId: string,
  razorpayPaymentId: string,
  razorpaySignature: string
) => {
  const payment = await PaymentRepository.findByOrderId(razorpayOrderId);

  if (!payment) {
    throw new AppError("Payment order not found", 404);
  }

  if (payment.userId.toString() !== userId) {
    throw new AppError("Unauthorized access to payment verification", 403);
  }

  const secret = process.env.RAZORPAY_KEY_SECRET || "";

  const generatedSignature = crypto
    .createHmac("sha256", secret)
    .update(`${razorpayOrderId}|${razorpayPaymentId}`)
    .digest("hex");

  if (generatedSignature !== razorpaySignature) {
    await PaymentRepository.updateStatus(
      razorpayOrderId,
      PaymentStatus.FAILED,
      "Signature mismatch"
    );

    throw new AppError("Invalid payment signature", 400);
  }

  await PaymentRepository.updateGatewayData(
    razorpayOrderId,
    razorpayPaymentId,
    razorpaySignature
  );

  const updated = await PaymentRepository.updateStatus(
    razorpayOrderId,
    PaymentStatus.PAID
  );

  await promoteSessionAfterPayment(updated);
  return updated;
};


/**
 * Handle Razorpay webhook events.
 *
 * SECURITY: We MUST verify the HMAC over the raw request body string,
 * NOT over a re-serialized JSON object. Re-serializing can change key
 * ordering / whitespace and will always produce a signature mismatch.
 * The app captures `req.rawBody` in app.ts for exactly this purpose.
 */
export const handleWebhookService = async (
  rawBody: string,
  signature: string
) => {
  const secret = ENV.RAZORPAY_WEBHOOK_SECRET || ENV.RAZORPAY_KEY_SECRET || "";

  const expectedSignature = crypto
    .createHmac("sha256", secret)
    .update(rawBody)
    .digest("hex");

  if (expectedSignature !== signature) {
    throw new AppError("Invalid webhook signature", 400);
  }

  // Parse after verification ? safe to use the parsed object now
  const payload = JSON.parse(rawBody) as Record<string, unknown>;
  const event = payload.event;

  if (event === "payment.captured") {
    const p = payload.payload as any;
    const paymentEntity = p.payment.entity;

    const orderId = paymentEntity.order_id;
    const paymentId = paymentEntity.id;

    const payment = await PaymentRepository.findByOrderId(orderId);

    if (payment && payment.status !== PaymentStatus.PAID) {
      await PaymentRepository.updateGatewayData(
        orderId,
        paymentId,
        "webhook_verified"
      );

      const updated = await PaymentRepository.updateStatus(
        orderId,
        PaymentStatus.PAID
      );
      await promoteSessionAfterPayment(updated);
    }
  }

  if (event === "payment.failed") {
    const p = payload.payload as any;
    const paymentEntity = p.payment.entity;

    const orderId = paymentEntity.order_id;

    const payment = await PaymentRepository.findByOrderId(orderId);

    if (payment) {
      await PaymentRepository.updateStatus(
        orderId,
        PaymentStatus.FAILED,
        paymentEntity.error_description
      );
    }
  }

  return { received: true };
};


export const getPaymentHistoryService = async (
  userId: string,
  limit: number,
  skip: number
) => {
  return await PaymentRepository.getPaymentHistory(
    userId,
    limit,
    skip
  );
};


export const getPaymentDetailsService = async (
  userId: string,
  paymentId: string
) => {
  const payment = await PaymentRepository.findById(paymentId);

  if (!payment) {
    throw new AppError("Payment not found", 404);
  }

  if (payment.userId.toString() !== userId) {
    throw new AppError("Unauthorized to view this payment", 403);
  }

  return payment;
};


export const subscribeService = async (
  userId: string,
  planId: string
) => {
  throw new AppError(
    "Subscription not implemented yet",
    501
  );
};


export const cancelSubscriptionService = async (
  userId: string,
  subscriptionId: string
) => {
  throw new AppError(
    "Cancel Subscription not implemented yet",
    501
  );
};


export const subscriptionStatusService = async (
  userId: string
) => {
  throw new AppError(
    "Subscription status not implemented yet",
    501
  );
};
