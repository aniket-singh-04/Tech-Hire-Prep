import { Types } from "mongoose";
import { Payment } from "../models/payment.model.ts";
import { IPayment, PaymentStatus } from "../types/payment.types.ts";

export class PaymentRepository {
  public static async create(data: Partial<IPayment>): Promise<IPayment> {
    const payment = new Payment(data);
    return await payment.save();
  }

  public static async findById(id: string): Promise<IPayment | null> {
    return await Payment.findById(id).exec();
  }

  public static async findByOrderId(orderId: string): Promise<IPayment | null> {
    return await Payment.findOne({ orderId }).exec();
  }

  public static async findByPaymentId(paymentId: string): Promise<IPayment | null> {
    return await Payment.findOne({ paymentId }).exec();
  }

  public static async updateStatus(
    orderId: string,
    status: PaymentStatus,
    failureReason?: string
  ): Promise<IPayment | null> {
    const updateData: any = { status };
    if (status === PaymentStatus.PAID) {
      updateData.paidAt = new Date();
    } else if (status === PaymentStatus.REFUNDED) {
      updateData.refundedAt = new Date();
    }
    if (failureReason) {
      updateData.failureReason = failureReason;
    }
    return await Payment.findOneAndUpdate({ orderId }, updateData, { returnDocument: "after" }).exec();
  }

  public static async updateGatewayData(
    orderId: string,
    paymentId: string,
    signature: string,
    paymentMethod?: string
  ): Promise<IPayment | null> {
    return await Payment.findOneAndUpdate(
      { orderId },
      { paymentId, signature, paymentMethod },
      { returnDocument: "after" }
    ).exec();
  }

  public static async getPaymentHistory(
    userId: string,
    limit: number = 10,
    skip: number = 0
  ): Promise<{ data: IPayment[]; total: number }> {
    const [data, total] = await Promise.all([
      Payment.find({ userId: new Types.ObjectId(userId) })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      Payment.countDocuments({ userId: new Types.ObjectId(userId) }).exec(),
    ]);
    return { data, total };
  }

  public static async findPendingPayments(
    limit: number = 50
  ): Promise<IPayment[]> {
    return await Payment.find({ status: PaymentStatus.PENDING })
      .limit(limit)
      .exec();
  }

  /**
   * Find a confirmed (PAID) payment for a specific user and session.
   * Used by the session join gate to enforce payment before entry.
   */
  public static async findPaidByUserAndSession(
    userId: string,
    sessionId: string
  ): Promise<IPayment | null> {
    return await Payment.findOne({
      userId: new Types.ObjectId(userId),
      "metadata.sessionId": sessionId,
      status: PaymentStatus.PAID,
    }).exec();
  }

  public static async save(paymentDoc: any): Promise<IPayment> {
    return await paymentDoc.save();
  }
}
