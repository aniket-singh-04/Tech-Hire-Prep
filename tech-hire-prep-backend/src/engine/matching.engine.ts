import { IInterview } from "../types/match.types.ts";
import { IProfile } from "../types/profile.types.ts";
import { getOnlineUsers } from "../socket/index.ts";

export class MatchingEngine {
  static filterEligibleCandidates(
    request: IInterview,
    requestingUserProfile: IProfile,
    allProfiles: IProfile[],
    activeSessionUserIds: string[]
  ): IProfile[] {
    const onlineUsersMap = getOnlineUsers();
    const currentDay = new Date().toLocaleString("en-US", { weekday: "long" }).toUpperCase();
    
    // Check if the current time fits within an availability slot "HH:mm"
    const currentTimeStr = new Date().toLocaleTimeString("en-US", { hour12: false, hour: "2-digit", minute: "2-digit" });
    console.log(currentTimeStr)
    return allProfiles.filter(profile => {
      // // 1. Cannot match with oneself
      // if (profile.userId.toString() === request.userId.toString()) return false;

      // // 2. User must be online
      // if (!onlineUsersMap.has(profile.userId.toString())) return false;

      // 3. User must not be occupied in an active session
      if (activeSessionUserIds.includes(profile.userId.toString())) return false;

      // 4. Profile score (completion) >= requesting user's profile score
      if (profile.profileCompletion < requestingUserProfile.profileCompletion) return false;

      // 5. Preferred role matches the requested target role (from profile or request)
      if (profile.targetRole !== request.preferredRole) return false;

      // 6. Currently available based on Profile availability (Day and Time)
      // If availability is empty, assume they are available if they are online (or strict based on product requirement).
      // Let's implement strict check if availability array exists.
      let isAvailableNow = true;
      if (profile.availability && profile.availability.length > 0) {
        const todaySlots = profile.availability.filter(a => a.day === currentDay);
        if (todaySlots.length === 0) {
          isAvailableNow = false;
        } else {
          isAvailableNow = todaySlots.some(slot => {
            return currentTimeStr >= slot.startTime && currentTimeStr <= slot.endTime;
          });
        }
      }
      
      if (!isAvailableNow) return false;

      return true;
    });
  }
}