import { ExperienceLevel, PreferredLanguage, TargetRole } from "../types/profile.types.ts";
import { IInterview, interviewType, matchStatus } from "../types/match.types.ts";
import mongoose, { HydratedDocument, Model, Schema } from "mongoose";

const InterviewRequestSchema = new Schema<IInterview>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    interviewType: {
      type: String,
      enum: Object.values(interviewType),
      required: true,
    },

    preferredRole: {
      type: String,
      enum: Object.values(TargetRole),
      required: true,
    },

    difficulty: {
      type: String,
      enum: Object.values(ExperienceLevel),
      required: true,
    },

    preferredLanguage: {
      type: String,
      enum: Object.values(PreferredLanguage),
      required: true,
    },

    duration: {
      type: Number,
      required: true,
      min: 15,
      max: 180,
    },

    status: {
      type: String,
      enum: Object.values(matchStatus),
      default: matchStatus.SEARCHING,
      index: true,
    },

    matchedUserId: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },

    interviewSessionId: {
      type: Schema.Types.ObjectId,
      ref: "InterviewSession",
    },
  },
  {
    timestamps: true,
    versionKey: false,
    strict: "throw"
  }
);

// Prevent duplicate active matchmaking requests
InterviewRequestSchema.index(
  { userId: 1, status: 1 },
  {
    unique: true,
    partialFilterExpression: {
      status: "SEARCHING",
    },
  }
);

// Fast matchmaking queries
InterviewRequestSchema.index({
  status: 1,
  interviewType: 1,
  difficulty: 1,
  preferredLanguage: 1,
});

export type InterviewRequest = HydratedDocument<IInterview>;
const InterviewRequestModel: Model<IInterview> = mongoose.models.InterviewRequest ?? mongoose.model<IInterview>(
  "InterviewRequest",
  InterviewRequestSchema
);
export default InterviewRequestModel;