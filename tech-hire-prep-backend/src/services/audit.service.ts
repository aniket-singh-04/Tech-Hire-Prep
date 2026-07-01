import mongoose from "mongoose";
import { AuditLog } from "../models/audit-log.model.js";

export const writeAuditLog = async (payload: {
  actorUserId?: string;
  action: string;
  targetType: string;
  targetId?: string;
  requestId?: string;
  ipAddress?: string;
  metadata?: Record<string, unknown>;
}) => {
  await AuditLog.create({
    actorUserId: payload.actorUserId ? new mongoose.Types.ObjectId(payload.actorUserId) : undefined,
    action: payload.action,
    targetType: payload.targetType,
    targetId: payload.targetId,
    requestId: payload.requestId,
    ipAddress: payload.ipAddress,
    metadata: payload.metadata,
  });
};
