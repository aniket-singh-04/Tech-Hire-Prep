import { Request } from "express";
import { ProfileDocument } from "../models/profile.model.ts";
import profileRepository from "../repositories/profile.repository.ts";
import { UserRepository } from "../repositories/user.repository.ts";
import { ExperienceLevel } from "../types/profile.types.ts";
import { AppError } from "../utils/appError.ts";
import { serializeProfile, serializePublicProfile, serializeUser } from "./serializer.service.ts";
import { getSignedUploadUrl } from "./s3.service.ts";
import { SaveAvatarDto, UpdateAvailabilityDto } from "../validators/user.validation.ts";
import { UserIdDto } from "../validators/auth.validation.ts";
import { UserStatus } from "../types/user.types.ts";
import { SessionRepository } from "../repositories/session.repository.ts";
const ALLOWED_IMAGE_CONTENT_TYPES = new Set(["image/jpeg", "image/png", "image/webp",]);

export const getMyPublicProfileService = async (username: string) => {
    const profile = await profileRepository.findPublicProfile(username);
    if (!profile) {
        throw new AppError("Profile not found.", 404);
    }

    const user = await UserRepository.findById(profile.userId.toString());
    if (!user) {
        throw new AppError("User not found.", 404);
    }

    return serializePublicProfile(user, profile);
};

export const getMyProfileService = async (payload: UserIdDto) => {
    const profile = await profileRepository.findByUserId(payload.userId);
    if (!profile) {
        throw new AppError("Profile not found", 404);
    }

    return serializeProfile(profile);
}

export const computeCompletionScore = (profile: Partial<ProfileDocument>): number => {
    let score = 0;
    if (profile.username?.trim()) score += 10;
    if (profile.headline?.trim()) score += 10;
    if (profile.bio?.trim()) score += 10;
    if (profile.college?.trim()) score += 5;
    if (profile.branch?.trim()) score += 5;
    if (profile.graduationYear) score += 5;
    if (profile.targetRole) score += 10;
    if (profile.experienceLevel) {
        switch (profile.experienceLevel) {
            case ExperienceLevel.ADVANCED:
                score += 15;
                break;
            case ExperienceLevel.INTERMEDIATE:
                score += 12;
                break;
            case ExperienceLevel.ENTRY_LEVEL:
                score += 8;
                break;
            case ExperienceLevel.BEGINNER:
            default:
                score += 5;
                break;
        }
    }
    if (Array.isArray(profile.skills) && profile.skills.length > 0) {
        if (profile.skills.length > 15) {
            score += 20;
        } else if (profile.skills.length > 10) {
            score += 15;
        } else if (profile.skills.length > 5) {
            score += 10;
        } else {
            score += 5;
        }
    }
    if (profile.socialLinks) {
        const hasSocials = Object.values(profile.socialLinks instanceof Map
            ? Object.fromEntries(profile.socialLinks)
            : profile.socialLinks
        ).some(link => typeof link === 'string' && link.trim() !== '');

        if (hasSocials) score += 5;
    }
    if (Array.isArray(profile.availability) && profile.availability.length > 0) {
        score += 5;
    }
    return Math.min(Math.max(score, 0), 100);
};

export const updateMyProfileService = async (userId: string, payload: Record<string, unknown>,) => {
    const profile = await profileRepository.updateByUserId(userId, payload);
    if (!profile) {
        throw new AppError("Profile not found", 404);
    }
    const score = computeCompletionScore(profile);
    const updatedProfile = await profileRepository.updateProfileCompletion(userId, score, score === 100 ? true : false);
    return updatedProfile;
};

const normalizeContentType = (value: string) => value.trim().toLowerCase();
const assertAllowedImageContentType = (contentType: string) => {
    const normalized = normalizeContentType(contentType);
    if (!ALLOWED_IMAGE_CONTENT_TYPES.has(normalized)) {
        throw new AppError("Only JPEG, PNG and WebP image uploads are allowed.", 400);
    }

    return normalized;
};

export const createUserAvatarUploadUrlService = async (req: Request<{}, {}, { fileName: string; contentType: string; }>, input: { fileName: string; contentType: string; },) => {
    const currentUserId = req.user?.id?.toString();
    if (!currentUserId) {
        throw new AppError("Unauthorized", 401);
    }

    const contentType = assertAllowedImageContentType(input.contentType);

    const sanitizedFileName = input.fileName.replace(/[^a-zA-Z0-9.\-_]/g, "-");
    const key = `users/${currentUserId}/avatar/${Date.now()}-${sanitizedFileName}`;

    return getSignedUploadUrl({ key, contentType, });
};

const assertAvatarStorageKey = (userId: string, s3Key: string) => {
    const normalizedKey = s3Key.trim();
    const allowedPrefix = `users/${userId}/avatar/`;
    if (!normalizedKey.startsWith(allowedPrefix)) {
        throw new AppError("Invalid avatar object key.", 400);
    }
    return normalizedKey;
};

export const saveUserAvatarService = async (req: Request, payload: SaveAvatarDto,) => {
    const currentUserId = req.user?.id?.toString();
    if (!currentUserId) {
        throw new AppError("Unauthorized", 401);
    }

    if (!payload.s3Key.trim()) {
        throw new AppError("s3Key is required", 400);
    }

    const nextAvatarKey = assertAvatarStorageKey(currentUserId, payload.s3Key);

    const user = await UserRepository.updateAvatar(currentUserId, {
        s3Key: nextAvatarKey,
        updatedAt: new Date()
    });

    if (!user) {
        throw new AppError("User not found", 404);
    }
    return serializeUser(user);
};

export const updateMyAvailabilityService = async (userId: string, payload: UpdateAvailabilityDto) => {
    const profile = await profileRepository.updateAvailability(userId, payload.availability);
    if (!profile) {
        throw new AppError("Profile is not found", 404);
    }
    const score = computeCompletionScore(profile);
    const updatedProfile = await profileRepository.updateProfileCompletion(userId, score, score === 100 ? true : false);
    return updatedProfile;
}

export const deleteAccountService = async (payload: UserIdDto) => {
    const user = await UserRepository.updateStatus(payload.userId, UserStatus.DELETED);
    if(!user){
        throw new AppError("User is not found.", 404);
    }
    const session = await SessionRepository.revokeAllUserSessions(payload.userId);
    return;
}
