import mongoose, { Schema, Model } from "mongoose";
import { IPayment, PaymentStatus, PaymentGateway, Currency } from "../types/payment.types.ts";

const paymentSchema = new Schema<IPayment>(
  {
    orderId: {
      type: String,
      required: true,
      unique: true,
      index: true
    },
    paymentId: {
      type: String,
      sparse: true,
      index: true
    },
    signature: {
      type: String,
    },
    amount: {
      type: Number,
      required: true,
    },
    currency: {
      type: String,
      enum: Object.values(Currency),
      required: true,
      default: Currency.INR
    },
    receipt: {
      type: String,
    },
    status: {
      type: String,
      enum: Object.values(PaymentStatus),
      default: PaymentStatus.CREATED,
      required: true,
      index: true
    },
    gateway: {
      type: String,
      enum: Object.values(PaymentGateway),
      default: PaymentGateway.RAZORPAY,
      required: true,
    },
    paymentMethod: {
      type: String,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },
    subscriptionId: {
      type: Schema.Types.ObjectId,
      ref: "Subscription",
      index: true
    },
    metadata: {
      type: Schema.Types.Mixed,
    },
    failureReason: {
      type: String,
    },
    paidAt: {
      type: Date,
    },
    refundedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

export const Payment: Model<IPayment> = mongoose.model<IPayment>("Payment", paymentSchema);
