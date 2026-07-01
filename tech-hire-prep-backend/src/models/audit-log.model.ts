import mongoose, { Schema, type HydratedDocument, type Model, type Types } from "mongoose";

export type AuditLogAttrs = {
  actorUserId?: Types.ObjectId;
  action: string;
  targetType: string;
  targetId?: string;
  requestId?: string;
  ipAddress?: string;
  metadata?: Record<string, unknown>;
};

export type AuditLogDocument = HydratedDocument<AuditLogAttrs>;

const auditLogSchema = new Schema<AuditLogAttrs>({
  actorUserId: { type: Schema.Types.ObjectId, ref: "User" },
  action: { type: String, required: true, index: true },
  targetType: { type: String, required: true },
  targetId: { type: String },
  requestId: { type: String },
  ipAddress: { type: String },
  metadata: { type: Schema.Types.Mixed },
}, { timestamps: true });

export const AuditLog: Model<AuditLogAttrs> =
  mongoose.models.AuditLog ?? mongoose.model<AuditLogAttrs>("AuditLog", auditLogSchema);
