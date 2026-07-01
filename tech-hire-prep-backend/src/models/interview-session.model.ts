import mongoose, { Schema, type HydratedDocument, type Model, type Types } from "mongoose";

export type SessionStatus = "pending" | "matched" | "scheduled" | "live" | "completed" | "cancelled";
export type SessionParticipantRole = "candidate" | "interviewer";

export type SessionParticipant = {
  userId: Types.ObjectId;
  role: SessionParticipantRole;
  joinedAt?: Date;
  leftAt?: Date;
  feedbackSubmitted: boolean;
};

export type SessionSignal = {
  fromUserId: Types.ObjectId;
  type: "offer" | "answer" | "ice-candidate";
  payload: Record<string, unknown>;
  createdAt: Date;
};

export type SessionScorecard = {
  overallScore: number;
  rubric: {
    communication: number;
    problemSolving: number;
    technicalDepth: number;
    clarity: number;
    collaboration: number;
    timeManagement: number;
  };
  strengths: string[];
  improvements: string[];
  generatedAt: Date;
};

export type InterviewSessionAttrs = {
  requestIds: Types.ObjectId[];
  participants: SessionParticipant[];
  status: SessionStatus;
  scheduledAt?: Date;
  startedAt?: Date;
  endedAt?: Date;
  roomId: string;
  editor: {
    language: string;
    code: string;
    version: number;
    lastUpdatedBy?: Types.ObjectId;
    lastUpdatedAt?: Date;
  };
  webrtcSignals: SessionSignal[];
  scorecard?: SessionScorecard;
  reports: Array<{ userId: Types.ObjectId; reason: string; createdAt: Date }>;
  ratingSummary: { averageRating: number; count: number };
};

export type InterviewSessionDocument = HydratedDocument<InterviewSessionAttrs>;

const participantSchema = new Schema<SessionParticipant>({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  role: { type: String, enum: ["candidate", "interviewer"], required: true },
  joinedAt: { type: Date },
  leftAt: { type: Date },
  feedbackSubmitted: { type: Boolean, default: false, required: true },
}, { _id: false });

const signalSchema = new Schema<SessionSignal>({
  fromUserId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  type: { type: String, enum: ["offer", "answer", "ice-candidate"], required: true },
  payload: { type: Schema.Types.Mixed, required: true },
  createdAt: { type: Date, required: true, default: Date.now },
}, { _id: false });

const scorecardSchema = new Schema<SessionScorecard>({
  overallScore: { type: Number, required: true },
  rubric: {
    communication: { type: Number, required: true },
    problemSolving: { type: Number, required: true },
    technicalDepth: { type: Number, required: true },
    clarity: { type: Number, required: true },
    collaboration: { type: Number, required: true },
    timeManagement: { type: Number, required: true },
  },
  strengths: { type: [String], default: [] },
  improvements: { type: [String], default: [] },
  generatedAt: { type: Date, required: true },
}, { _id: false });

const interviewSessionSchema = new Schema<InterviewSessionAttrs>({
  requestIds: { type: [Schema.Types.ObjectId], ref: "InterviewRequest", default: [] },
  participants: { type: [participantSchema], required: true },
  status: { type: String, enum: ["pending", "matched", "scheduled", "live", "completed", "cancelled"], default: "matched", required: true },
  scheduledAt: { type: Date },
  startedAt: { type: Date },
  endedAt: { type: Date },
  roomId: { type: String, required: true, unique: true, index: true },
  editor: {
    language: { type: String, default: "javascript" },
    code: { type: String, default: "function solve() {\n  return true;\n}" },
    version: { type: Number, default: 1 },
    lastUpdatedBy: { type: Schema.Types.ObjectId, ref: "User" },
    lastUpdatedAt: { type: Date },
  },
  webrtcSignals: { type: [signalSchema], default: [] },
  scorecard: { type: scorecardSchema },
  reports: {
    type: [{
      userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
      reason: { type: String, required: true },
      createdAt: { type: Date, required: true, default: Date.now },
    }],
    default: [],
  },
  ratingSummary: {
    averageRating: { type: Number, default: 0 },
    count: { type: Number, default: 0 },
  },
}, { timestamps: true });

export const InterviewSession: Model<InterviewSessionAttrs> =
  mongoose.models.InterviewSession ?? mongoose.model<InterviewSessionAttrs>("InterviewSession", interviewSessionSchema);
