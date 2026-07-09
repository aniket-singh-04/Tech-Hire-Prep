import mongoose, { HydratedDocument, Model, Schema } from "mongoose";

export enum InterviewSessionStatus {
  SCHEDULED = "SCHEDULED",
  ACTIVE = "ACTIVE",
  COMPLETED = "COMPLETED",
  CANCELLED = "CANCELLED",
}

export interface IInterviewSession {
  matchId: mongoose.Types.ObjectId;
  interviewerId: mongoose.Types.ObjectId;
  intervieweeId: mongoose.Types.ObjectId;
  status: InterviewSessionStatus;
  startTime?: Date;
  endTime?: Date;
  roomId: string;
  interviewerJoinedAt?: Date;
  intervieweeJoinedAt?: Date;
  notes?: string;
  feedback?: string;
  rating?: number;
  // Editor state
  code?: string;
  language?: string;
}

const InterviewSessionSchema = new Schema<IInterviewSession>(
  {
    matchId: {
      type: Schema.Types.ObjectId,
      ref: "InterviewRequest",
      required: true,
      index: true,
    },
    interviewerId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    intervieweeId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: Object.values(InterviewSessionStatus),
      default: InterviewSessionStatus.SCHEDULED,
      required: true,
    },
    startTime: {
      type: Date,
    },
    endTime: {
      type: Date,
    },
    roomId: {
      type: String,
      required: true,
      unique: true,
    },
    interviewerJoinedAt: {
      type: Date,
    },
    intervieweeJoinedAt: {
      type: Date,
    },
    notes: {
      type: String,
    },
    feedback: {
      type: String,
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
    },
    code: {
      type: String,
    },
    language: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
    strict: "throw",
  }
);

export type InterviewSessionDocument = HydratedDocument<IInterviewSession>;
const InterviewSessionModel: Model<IInterviewSession> = mongoose.models.InterviewSession ?? mongoose.model<IInterviewSession>(
  "InterviewSession",
  InterviewSessionSchema
);

export default InterviewSessionModel;
