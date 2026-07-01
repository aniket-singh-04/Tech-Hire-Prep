import mongoose from "mongoose";
import { PointTransaction } from "../models/point-transaction.model.js";
import { AppError } from "../utils/appError.js";
import { writeAuditLog } from "./audit.service.js";

export const recordPointTransaction = async (payload: {
  userId: string;
  sessionId?: string;
  type: "earn" | "spend" | "redeem" | "adjustment";
  reason: string;
  amount: number;
  idempotencyKey: string;
  metadata?: Record<string, unknown>;
  auditContext?: { requestId?: string; ipAddress?: string };
}) => {
  const existing = await PointTransaction.findOne({ idempotencyKey: payload.idempotencyKey }).lean();
  if (existing) return existing;

  const transaction = await PointTransaction.create({
    userId: new mongoose.Types.ObjectId(payload.userId),
    sessionId: payload.sessionId ? new mongoose.Types.ObjectId(payload.sessionId) : undefined,
    type: payload.type,
    reason: payload.reason,
    amount: payload.amount,
    idempotencyKey: payload.idempotencyKey,
    metadata: payload.metadata,
  });

  await writeAuditLog({ actorUserId: payload.userId, action: "wallet.transaction_created", targetType: "point_transaction", targetId: transaction._id.toString(), requestId: payload.auditContext?.requestId, ipAddress: payload.auditContext?.ipAddress, metadata: { reason: payload.reason, amount: payload.amount } });
  return transaction.toObject();
};

export const getWalletBalance = async (userId: string) => {
  const [result] = await PointTransaction.aggregate([{ $match: { userId: new mongoose.Types.ObjectId(userId) } }, { $group: { _id: null, balance: { $sum: "$amount" } } }]);
  return result?.balance ?? 0;
};

export const getWalletLedger = async (userId: string) => {
  const ledger = await PointTransaction.find({ userId: new mongoose.Types.ObjectId(userId) }).sort({ createdAt: -1 }).lean();
  const balance = await getWalletBalance(userId);
  return {
    balance,
    transactions: ledger.map((item: any) => ({
      id: item._id.toString(),
      sessionId: item.sessionId?.toString(),
      type: item.type,
      reason: item.reason,
      amount: item.amount,
      metadata: item.metadata,
      createdAt: item.createdAt,
    })),
  };
};

export const spendPoints = async (userId: string, amount: number, reason: string, auditContext?: { requestId?: string; ipAddress?: string }) => {
  const balance = await getWalletBalance(userId);
  if (balance < amount) throw new AppError("Insufficient points balance.", 400);
  return recordPointTransaction({ userId, type: "spend", reason, amount: -Math.abs(amount), idempotencyKey: `spend:${userId}:${reason}:${amount}:${Date.now()}`, auditContext });
};

export const earnPoints = async (userId: string, amount: number, reason: string, auditContext?: { requestId?: string; ipAddress?: string }) =>
  recordPointTransaction({ userId, type: "earn", reason, amount: Math.abs(amount), idempotencyKey: `earn:${userId}:${reason}:${amount}:${Date.now()}`, auditContext });

export const redeemPoints = async (userId: string, amount: number, reason: string, auditContext?: { requestId?: string; ipAddress?: string }) => {
  const balance = await getWalletBalance(userId);
  if (balance < amount) throw new AppError("Insufficient points balance.", 400);
  return recordPointTransaction({ userId, type: "redeem", reason, amount: -Math.abs(amount), idempotencyKey: `redeem:${userId}:${reason}:${amount}:${Date.now()}`, auditContext });
};
