import profileRepository from "../repositories/profile.repository.ts";
import { MatchRepository } from "../repositories/match.repository.ts";
import { UserRepository } from "../repositories/user.repository.ts";
import { AppError } from "../utils/appError.ts";
import { Types } from "mongoose";

export class EligibilityService {
  static async validateForMatchmaking(
    userId: Types.ObjectId
  ): Promise<void> {
    const user = await UserRepository.findById(userId.toString());

    if (!user) {
      throw new AppError("User not found.", 404);
    }

    if (user.deletedAt) {
      throw new AppError("Account has been deleted.", 403);
    }

    if (!user.isEmailVerified) {
      throw new AppError(
        "Verify your email before requesting a match.",
        403
      );
    }

    const profile =
      await profileRepository.findByUserId(userId.toString());

    if (!profile) {
      throw new AppError(
        "Profile not found.",
        404
      );
    }

    if (!profile.isProfileCompleted) {
      throw new AppError(
        "Complete your profile before requesting a match.",
        400
      );
    }

    const activeRequest =
      await MatchRepository.findActiveRequestByUserId(
        userId
      );

    if (activeRequest) {
      throw new AppError(
        "You already have an active matchmaking request.",
        409
      );
    }

    return;
  }
}