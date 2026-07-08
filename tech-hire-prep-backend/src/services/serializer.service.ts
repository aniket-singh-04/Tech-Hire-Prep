import { UserStatus } from "../types/user.types.ts";
import { UserDocument } from "../models/user.model.ts";
import { ProfileDocument } from "../models/profile.model.ts";
import { getSignedReadUrl } from "./s3.service.ts";

const getScopedAvatarUrl = async (userId: string, s3Key?: string) => {
  const normalizedKey = s3Key?.trim();
  if (!normalizedKey || !normalizedKey.startsWith(`users/${userId}/avatar/`)) {
    return "";
  }

  return getSignedReadUrl(normalizedKey);
};

export const serializeUser = async (user: UserDocument) => ({
  id: user._id.toString(),
  name: user.name,
  email: user.email,
  role: user.role,
  imageUrl: await getScopedAvatarUrl(user._id.toString(), user.avatarUrl?.s3Key),
  emailVerifiedAt: user.emailVerifiedAt ?? null,
  status: user.status ?? UserStatus.ACTIVE,
});

export const serializePublicProfile = (user: UserDocument, profile: ProfileDocument) => {
  return {
    fullName: user.name,
    avatar: user.avatarUrl.s3Key,
    role: user.role,
    isVerified: user.isEmailVerified,
    username: profile.username,
    headline: profile.headline,
    bio: profile.bio,
    college: profile.college,
    branch: profile.branch,
    graduationYear: profile.graduationYear,
    targetRole: profile.targetRole,
    experienceLevel: profile.experienceLevel,
    skills: profile.skills,
    socialLinks: profile.socialLinks,
    preferences: profile.preferences,
    availability: profile.availability,
  };
};

export const serializeProfile = (profile: ProfileDocument, user?: UserDocument,) => {
  return {
    id: user?._id.toString(),
    fullName: user?.name,
    avatar: user?.avatarUrl.s3Key,
    role: user?.role,
    isVerified: user?.isEmailVerified,
    username: profile.username,
    headline: profile.headline,
    bio: profile.bio,
    college: profile.college,
    branch: profile.branch,
    graduationYear: profile.graduationYear,
    targetRole: profile.targetRole,
    experienceLevel: profile.experienceLevel,
    skills: profile.skills,
    socialLinks: profile.socialLinks,
    preferences: profile.preferences,
    availability: profile.availability,
    profileCompletion: profile.profileCompletion,
    isProfileCompleted: profile.isProfileCompleted,
    createdAt: user?.createdAt,
    updatedAt: user?.updatedAt,
  };
};


