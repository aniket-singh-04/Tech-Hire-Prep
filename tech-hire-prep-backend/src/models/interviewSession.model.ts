import mongoose, { HydratedDocument, Model, Schema } from "mongoose";

export enum InterviewSessionStatus {
  CREATED = "CREATED",
  SCHEDULED = "SCHEDULED",
  READY = "READY",
  JOINED = "JOINED",
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
  scheduledAt?: Date;
  readyAt?: Date;
  roomId: string;
  interviewerJoinedAt?: Date;
  intervieweeJoinedAt?: Date;
  interviewerLeftAt?: Date;
  intervieweeLeftAt?: Date;
  reports?: Array<{
    userId: mongoose.Types.ObjectId;
    reason: string;
    createdAt: Date;
  }>;
  feedbackEntries?: Array<{
    fromUserId: mongoose.Types.ObjectId;
    toUserId: mongoose.Types.ObjectId;
    feedback: string;
    createdAt: Date;
  }>;
  ratings?: Array<{
    fromUserId: mongoose.Types.ObjectId;
    toUserId: mongoose.Types.ObjectId;
    value: number;
    createdAt: Date;
  }>;
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
      default: InterviewSessionStatus.CREATED,
      required: true,
    },
    startTime: {
      type: Date,
    },
    endTime: {
      type: Date,
    },
    scheduledAt: {
      type: Date,
    },
    readyAt: {
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
    interviewerLeftAt: {
      type: Date,
    },
    intervieweeLeftAt: {
      type: Date,
    },
    reports: [
      {
        userId: {
          type: Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        reason: {
          type: String,
          required: true,
          trim: true,
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    feedbackEntries: [
      {
        fromUserId: {
          type: Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        toUserId: {
          type: Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        feedback: {
          type: String,
          required: true,
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    ratings: [
      {
        fromUserId: {
          type: Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        toUserId: {
          type: Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        value: {
          type: Number,
          min: 1,
          max: 5,
          required: true,
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
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
