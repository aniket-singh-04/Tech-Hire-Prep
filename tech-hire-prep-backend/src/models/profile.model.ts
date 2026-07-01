import mongoose, { Schema, type HydratedDocument, type Model, type Types } from "mongoose";

export type AvailabilitySlot = {
  day: string;
  start: string;
  end: string;
  timezone: string;
};

export type ProfilePreferences = {
  interviewTypes: string[];
  preferredLanguages: string[];
  focusAreas: string[];
};

export type VerificationFields = {
  collegeName?: string;
  collegeEmail?: string;
  githubUrl?: string;
  linkedinUrl?: string;
  resumeUrl?: string;
};

export type ProfileAttrs = {
  userId: Types.ObjectId;
  headline?: string;
  bio?: string;
  targetRole?: string;
  skillTags: string[];
  experienceLevel?: number;
  availability: AvailabilitySlot[];
  preferences: ProfilePreferences;
  verification: VerificationFields;
  college?: string;
  graduationYear?: number;
  completionScore: number;
  onboardingStep: number;
  onboardingCompleted: boolean;
};

export type ProfileDocument = HydratedDocument<ProfileAttrs>;

const availabilitySchema = new Schema<AvailabilitySlot>({
  day: { type: String, required: true, trim: true },
  start: { type: String, required: true },
  end: { type: String, required: true },
  timezone: { type: String, required: true },
}, { _id: false });

const preferencesSchema = new Schema<ProfilePreferences>({
  interviewTypes: { type: [String], default: [] },
  preferredLanguages: { type: [String], default: [] },
  focusAreas: { type: [String], default: [] },
}, { _id: false });

const verificationSchema = new Schema<VerificationFields>({
  collegeName: { type: String },
  collegeEmail: { type: String },
  githubUrl: { type: String },
  linkedinUrl: { type: String },
  resumeUrl: { type: String },
}, { _id: false });

const profileSchema = new Schema<ProfileAttrs>({
  userId: { type: Schema.Types.ObjectId, ref: "User", unique: true, required: true, index: true },
  headline: { type: String, trim: true, maxlength: 120 },
  bio: { type: String, trim: true, maxlength: 600 },
  targetRole: { type: String, trim: true },
  skillTags: { type: [String], default: [] },
  experienceLevel: { type: Number, min: 0, max: 15 },
  availability: { type: [availabilitySchema], default: [] },
  preferences: { type: preferencesSchema, default: () => ({}) },
  verification: { type: verificationSchema, default: () => ({}) },
  college: { type: String, trim: true },
  graduationYear: { type: Number, min: 2000, max: 2100 },
  completionScore: { type: Number, default: 0, min: 0, max: 100 },
  onboardingStep: { type: Number, default: 0, min: 0, max: 4 },
  onboardingCompleted: { type: Boolean, default: false },
}, { timestamps: true });

export const Profile: Model<ProfileAttrs> =
  mongoose.models.Profile ?? mongoose.model<ProfileAttrs>("Profile", profileSchema);
