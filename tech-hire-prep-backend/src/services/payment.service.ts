import Razorpay from "razorpay";
import crypto from "crypto";
import { Types } from "mongoose";
import { PAYMENT_CONSTANTS } from "../constants/payment.constants.ts";
import { PaymentRepository } from "../repositories/payment.repository.ts";
import { Currency, PaymentGateway, PaymentStatus } from "../types/payment.types.ts";
import { AppError } from "../utils/appError.ts";

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || "",
  key_secret: process.env.RAZORPAY_KEY_SECRET || "",
});

export const createOrderService = async (
  userId: string,
  sessionId?: string,
  metadata?: Record<string, unknown>
) => {
  const amountInPaise = Math.round(PAYMENT_CONSTANTS.INTERVIEW_COST_INR * 100);
  const receiptId = `receipt_${Date.now()}_${userId}`;

  try {
    const order = await razorpay.orders.create({
      amount: amountInPaise,
      currency: PAYMENT_CONSTANTS.CURRENCY_INR,
      receipt: receiptId,
    });

    // Merge sessionId into metadata so we can link payment → session later
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
    };
  } catch (error: any) {
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

  return await PaymentRepository.updateStatus(
    razorpayOrderId,
    PaymentStatus.PAID
  );
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
  const secret =
    process.env.RAZORPAY_WEBHOOK_SECRET ||
    process.env.RAZORPAY_KEY_SECRET ||
    "";

  const expectedSignature = crypto
    .createHmac("sha256", secret)
    .update(rawBody)
    .digest("hex");

  if (expectedSignature !== signature) {
    throw new AppError("Invalid webhook signature", 400);
  }

  // Parse after verification — safe to use the parsed object now
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

      await PaymentRepository.updateStatus(
        orderId,
        PaymentStatus.PAID
      );
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