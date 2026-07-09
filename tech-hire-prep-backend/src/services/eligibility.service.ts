import { Types } from "mongoose";

import { AppError } from "@/utils/AppError";

import { UserRepository } from "../user/user.repository";
import { ProfileRepository } from "../profile/profile.repository";
import { MatchRepository } from "./match.repository";

export class EligibilityService {
  static async validateForMatchmaking(
    userId: Types.ObjectId
  ): Promise<void> {
    const user = await UserRepository.findById(userId);

    if (!user) {
      throw new AppError(404, "User not found.");
    }

    if (user.deletedAt) {
      throw new AppError(403, "Account has been deleted.");
    }

    if (!user.isEmailVerified) {
      throw new AppError(
        403,
        "Verify your email before requesting a match."
      );
    }

    const profile =
      await ProfileRepository.findByUserId(userId);

    if (!profile) {
      throw new AppError(
        404,
        "Profile not found."
      );
    }

    if (!profile.isProfileCompleted) {
      throw new AppError(
        400,
        "Complete your profile before requesting a match."
      );
    }

    const activeRequest =
      await MatchRepository.findActiveRequestByUserId(
        userId
      );

    if (activeRequest) {
      throw new AppError(
        409,
        "You already have an active matchmaking request."
      );
    }

    // Future validations:
    // - Live interview exists?
    // - Scheduled interview overlap?
    // - User suspended?
    // - Daily matchmaking limit?
    // - Reputation too low?

    return;
  }
}