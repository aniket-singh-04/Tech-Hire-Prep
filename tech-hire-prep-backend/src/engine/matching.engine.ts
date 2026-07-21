import { IInterview } from "../types/match.types.ts";
import { IProfile } from "../types/profile.types.ts";
import { now } from "../utils/date.utils.ts";

export class MatchingEngine {
  static filterEligibleCandidates(
    request: IInterview,
    requestingUserProfile: IProfile,
    allProfiles: IProfile[],
    activeSessionUserIds: string[],
  ): IProfile[] {

    const current = now();
    const currentDay = current.englishDay?.toUpperCase();

    return allProfiles.filter((profile) => {
      // 1. User must not be occupied in an active session
      if (activeSessionUserIds.includes(profile.userId.toString())) {
        return false;
      }

      // 2. Profile completion should be >= requester
      if (
        profile.profileCompletion <
        requestingUserProfile.profileCompletion
      ) {
        return false;
      }

      // 3. Target role must match
      if (profile.targetRole !== request.preferredRole) {
        return false;
      }

      // 4. Check availability
      let isAvailableNow = true;

      if (profile.availability?.length) {
        const todaySlots = profile.availability.filter(
          (slot) => slot.day.toUpperCase() === currentDay
        );

        if (!todaySlots.length) {
          isAvailableNow = false;
        } else {
          isAvailableNow = todaySlots.some((slot) => {
            return (
              current.timeWithMin >= slot.startTime && current.timeWithMin <= slot.endTime
            );
          });
        }
      }

      return isAvailableNow;
    });
  }
}