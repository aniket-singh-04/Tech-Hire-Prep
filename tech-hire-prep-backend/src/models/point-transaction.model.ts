import mongoose, { Schema, type HydratedDocument, type Model, type Types } from "mongoose";

export type PointTransactionType = "earn" | "spend" | "redeem" | "adjustment";

export type PointTransactionAttrs = {
  userId: Types.ObjectId;
  sessionId?: Types.ObjectId;
  type: PointTransactionType;
  reason: string;
  amount: number;
  idempotencyKey: string;
  metadata?: Record<string, unknown>;
};

export type PointTransactionDocument = HydratedDocument<PointTransactionAttrs>;

const pointTransactionSchema = new Schema<PointTransactionAttrs>({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
  sessionId: { type: Schema.Types.ObjectId, ref: "InterviewSession" },
  type: { type: String, enum: ["earn", "spend", "redeem", "adjustment"], required: true },
  reason: { type: String, required: true, trim: true },
  amount: { type: Number, required: true },
  idempotencyKey: { type: String, required: true, unique: true, index: true },
  metadata: { type: Schema.Types.Mixed },
}, { timestamps: true });

export const PointTransaction: Model<PointTransactionAttrs> =
  mongoose.models.PointTransaction ?? mongoose.model<PointTransactionAttrs>("PointTransaction", pointTransactionSchema);
