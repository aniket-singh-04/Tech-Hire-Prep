import mongoose, { Schema, type HydratedDocument, type Model, type Types } from "mongoose";

export type RubricScores = {
  communication: number;
  problemSolving: number;
  technicalDepth: number;
  clarity: number;
  collaboration: number;
  timeManagement: number;
};

export type SessionFeedbackAttrs = {
  sessionId: Types.ObjectId;
  fromUserId: Types.ObjectId;
  toUserId: Types.ObjectId;
  rating: number;
  rubric: RubricScores;
  strengths: string[];
  improvements: string[];
  summary?: string;
  recommendation?: "strong_hire" | "hire" | "mixed" | "no_hire";
};

export type SessionFeedbackDocument = HydratedDocument<SessionFeedbackAttrs>;

const rubricSchema = new Schema<RubricScores>({
  communication: { type: Number, required: true, min: 1, max: 5 },
  problemSolving: { type: Number, required: true, min: 1, max: 5 },
  technicalDepth: { type: Number, required: true, min: 1, max: 5 },
  clarity: { type: Number, required: true, min: 1, max: 5 },
  collaboration: { type: Number, required: true, min: 1, max: 5 },
  timeManagement: { type: Number, required: true, min: 1, max: 5 },
}, { _id: false });

const sessionFeedbackSchema = new Schema<SessionFeedbackAttrs>({
  sessionId: { type: Schema.Types.ObjectId, ref: "InterviewSession", required: true, index: true },
  fromUserId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
  toUserId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  rubric: { type: rubricSchema, required: true },
  strengths: { type: [String], default: [] },
  improvements: { type: [String], default: [] },
  summary: { type: String, trim: true, maxlength: 500 },
  recommendation: { type: String, enum: ["strong_hire", "hire", "mixed", "no_hire"] },
}, { timestamps: true });

sessionFeedbackSchema.index({ sessionId: 1, fromUserId: 1 }, { unique: true });

export const SessionFeedback: Model<SessionFeedbackAttrs> =
  mongoose.models.SessionFeedback ?? mongoose.model<SessionFeedbackAttrs>("SessionFeedback", sessionFeedbackSchema);
