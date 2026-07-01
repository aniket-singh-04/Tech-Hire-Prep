import mongoose, { Schema, type HydratedDocument, type Model, type Types } from "mongoose";
import type { AvailabilitySlot } from "./profile.model.js";

export type InterviewRequestStatus = "pending" | "matched" | "cancelled" | "expired";

export type InterviewRequestAttrs = {
  requesterId: Types.ObjectId;
  status: InterviewRequestStatus;
  targetRole: string;
  skillTags: string[];
  experienceLevel?: number;
  availability: AvailabilitySlot[];
  notes?: string;
  matchedUserId?: Types.ObjectId;
  matchedAt?: Date;
  sessionId?: Types.ObjectId;
  expiresAt: Date;
};

export type InterviewRequestDocument = HydratedDocument<InterviewRequestAttrs>;

const availabilitySchema = new Schema<AvailabilitySlot>({
  day: { type: String, required: true },
  start: { type: String, required: true },
  end: { type: String, required: true },
  timezone: { type: String, required: true },
}, { _id: false });

const interviewRequestSchema = new Schema<InterviewRequestAttrs>({
  requesterId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
  status: { type: String, enum: ["pending", "matched", "cancelled", "expired"], default: "pending", required: true },
  targetRole: { type: String, required: true, trim: true },
  skillTags: { type: [String], default: [] },
  experienceLevel: { type: Number, min: 0, max: 15 },
  availability: { type: [availabilitySchema], default: [] },
  notes: { type: String, trim: true, maxlength: 300 },
  matchedUserId: { type: Schema.Types.ObjectId, ref: "User" },
  matchedAt: { type: Date },
  sessionId: { type: Schema.Types.ObjectId, ref: "InterviewSession" },
  expiresAt: { type: Date, required: true, index: true },
}, { timestamps: true });

export const InterviewRequest: Model<InterviewRequestAttrs> =
  mongoose.models.InterviewRequest ?? mongoose.model<InterviewRequestAttrs>("InterviewRequest", interviewRequestSchema);
