import profileRepository from "../repositories/profile.repository.ts";
import { UserRepository } from "../repositories/user.repository.ts";
import { AppError } from "../utils/appError.ts";
import { serializeProfile, serializePublicProfile } from "./serializer.service.ts";

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

export const getMyProfileService = async (userId: string) => {
    const profile = await profileRepository.findByUserId(userId);
    if (!profile) {
        throw new AppError("Profile not found", 404);
    }

    return serializeProfile(profile);
}
