import { Types } from "mongoose";

export enum PaymentStatus {
  CREATED = "CREATED",
  PENDING = "PENDING",
  PAID = "PAID",
  FAILED = "FAILED",
  REFUNDED = "REFUNDED",
  CANCELLED = "CANCELLED"
}

export enum SubscriptionStatus {
  ACTIVE = "ACTIVE",
  CANCELLED = "CANCELLED",
  EXPIRED = "EXPIRED"
}

export enum PaymentGateway {
  RAZORPAY = "RAZORPAY"
}

export enum Currency {
  INR = "INR"
}

export interface IPayment {
  _id?: Types.ObjectId;
  orderId: string;
  paymentId?: string;
  signature?: string;
  amount: number;
  currency: Currency;
  receipt?: string;
  status: PaymentStatus;
  gateway: PaymentGateway;
  paymentMethod?: string;
  userId: Types.ObjectId;
  subscriptionId?: Types.ObjectId;
  metadata?: Record<string, unknown>;
  failureReason?: string;
  paidAt?: Date;
  refundedAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}
