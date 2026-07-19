import { IInterview } from "../types/match.types.ts";
import { IProfile } from "../types/profile.types.ts";

export class MatchingEngine {
  static filterEligibleCandidates(
    request: IInterview,
    requestingUserProfile: IProfile,
    allProfiles: IProfile[],
    activeSessionUserIds: string[],
  ): IProfile[] {
    const currentDay = new Date()
      .toLocaleString("en-US", { weekday: "long", timeZone: "Asia/Kolkata" })
      .toUpperCase();

    // Check if the current time fits within an availability slot "HH:mm"
    const currentTimeStr = new Date().toLocaleTimeString("en-US", {
      hour12: false,
      hour: "2-digit",
      minute: "2-digit",
      timeZone: "Asia/Kolkata",
    });

    return allProfiles.filter((profile) => {
      // 1. User must not be occupied in an active session
      if (activeSessionUserIds.includes(profile.userId.toString())) return false;

      // 2. Profile score (completion) >= requesting user's profile score
      if (profile.profileCompletion < requestingUserProfile.profileCompletion) return false;

      // 3. Preferred role matches the requested target role (from profile or request)
      if (profile.targetRole !== request.preferredRole) return false;

      // 4. Currently available based on Profile availability (Day and Time)
      // If availability is empty, assume they are available if they are online (or strict based on product requirement).
      // Let's implement strict check if availability array exists.
      let isAvailableNow = true;
      if (profile.availability && profile.availability.length > 0) {
        const todaySlots = profile.availability.filter(
          (a) => a.day === currentDay,
        );
        if (todaySlots.length === 0) {
          isAvailableNow = false;
        } else {
          isAvailableNow = todaySlots.some((slot) => {
            return (
              currentTimeStr >= slot.startTime && currentTimeStr <= slot.endTime
            );
          });
        }
      }

      if (!isAvailableNow) return false;

      return true;
    });
  }
}