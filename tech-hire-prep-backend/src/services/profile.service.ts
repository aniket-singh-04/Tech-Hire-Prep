import mongoose from "mongoose";
import { Profile, type ProfileDocument } from "../models/profile.model.js";
import { User } from "../models/user.model.js";
import { writeAuditLog } from "./audit.service.js";
import { AppError } from "../utils/appError.js";

const computeCompletionScore = (profile: Partial<ProfileDocument>) => {
  let score = 0;
  if (profile.targetRole) score += 15;
  if ((profile.skillTags?.length ?? 0) >= 3) score += 20;
  if (profile.experienceLevel !== undefined) score += 10;
  if ((profile.availability?.length ?? 0) > 0) score += 20;
  if (profile.bio) score += 10;
  if (profile.college) score += 10;
  if (profile.graduationYear) score += 5;
  if ((profile.preferences?.preferredLanguages?.length ?? 0) > 0) score += 5;
  if (profile.verification?.githubUrl || profile.verification?.linkedinUrl || profile.verification?.resumeUrl) score += 5;
  return Math.min(score, 100);
};

const toProfileView = (profile: ProfileDocument) => ({
  id: profile._id.toString(),
  userId: profile.userId.toString(),
  headline: profile.headline,
  bio: profile.bio,
  targetRole: profile.targetRole,
  skillTags: profile.skillTags,
  experienceLevel: profile.experienceLevel,
  availability: profile.availability,
  preferences: profile.preferences,
  verification: profile.verification,
  college: profile.college,
  graduationYear: profile.graduationYear,
  completionScore: profile.completionScore,
  onboardingStep: profile.onboardingStep,
  onboardingCompleted: profile.onboardingCompleted,
});

export const getOrCreateProfile = async (userId: string) => {
  const existing = await Profile.findOne({ userId: new mongoose.Types.ObjectId(userId) });
  if (existing) return existing;

  return Profile.create({
    userId: new mongoose.Types.ObjectId(userId),
    skillTags: [],
    availability: [],
    preferences: { interviewTypes: [], preferredLanguages: [], focusAreas: [] },
    verification: {},
    completionScore: 0,
    onboardingStep: 0,
    onboardingCompleted: false,
  });
};

export const getMyProfile = async (userId: string) => toProfileView(await getOrCreateProfile(userId));

export const updateMyProfile = async (userId: string, payload: Record<string, unknown>, auditContext?: { requestId?: string; ipAddress?: string }) => {
  const profile = await getOrCreateProfile(userId);
  profile.set(payload);
  profile.completionScore = computeCompletionScore(profile);
  if (profile.completionScore >= 70 && profile.availability.length > 0 && profile.targetRole) {
    profile.onboardingCompleted = true;
    profile.onboardingStep = Math.max(profile.onboardingStep, 4);
  }
  await profile.save();

  await writeAuditLog({ actorUserId: userId, action: "profile.updated", targetType: "profile", targetId: profile._id.toString(), requestId: auditContext?.requestId, ipAddress: auditContext?.ipAddress });
  return toProfileView(profile);
};

export const getCurrentUser = async (userId: string) => {
  const user = await User.findById(userId).lean();
  if (!user || user.status === "deleted") throw new AppError("User not found.", 404);
  const profile = await getOrCreateProfile(userId);

  return {
    id: user._id.toString(),
    email: user.email,
    name: user.name,
    role: user.role,
    status: user.status,
    avatarUrl: user.avatarUrl,
    isEmailVerified: user.isEmailVerified,
    profile: toProfileView(profile),
  };
};

export const getPublicUserProfile = async (userId: string) => {
  const user = await User.findById(userId).lean();
  if (!user || user.status === "deleted") throw new AppError("User not found.", 404);
  const profile = await getOrCreateProfile(userId);

  return {
    id: user._id.toString(),
    name: user.name,
    role: user.role,
    avatarUrl: user.avatarUrl,
    profile: {
      headline: profile.headline,
      targetRole: profile.targetRole,
      skillTags: profile.skillTags,
      experienceLevel: profile.experienceLevel,
      college: profile.college,
      completionScore: profile.completionScore,
    },
  };
};

export const updateAvatar = async (userId: string, avatarUrl: string, auditContext?: { requestId?: string; ipAddress?: string }) => {
  const user = await User.findByIdAndUpdate(userId, { avatarUrl }, { new: true }).lean();
  if (!user) throw new AppError("User not found.", 404);
  await writeAuditLog({ actorUserId: userId, action: "profile.avatar_updated", targetType: "user", targetId: userId, requestId: auditContext?.requestId, ipAddress: auditContext?.ipAddress });
  return { avatarUrl: user.avatarUrl };
};

export const deleteCurrentUser = async (userId: string, auditContext?: { requestId?: string; ipAddress?: string }) => {
  const user = await User.findById(userId);
  if (!user) throw new AppError("User not found.", 404);
  user.status = "deleted";
  user.deletedAt = new Date();
  user.refreshTokens = [];
  await user.save();
  await writeAuditLog({ actorUserId: userId, action: "user.deleted", targetType: "user", targetId: userId, requestId: auditContext?.requestId, ipAddress: auditContext?.ipAddress });
};
