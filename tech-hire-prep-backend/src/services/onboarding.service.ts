import { getOrCreateProfile, updateMyProfile } from "./profile.service.js";

export const submitOnboardingStep = async (
  userId: string,
  step: 1 | 2 | 3,
  payload: Record<string, unknown>,
  auditContext?: { requestId?: string; ipAddress?: string },
) => {
  const profile = await updateMyProfile(userId, payload, auditContext);
  await updateMyProfile(userId, { onboardingStep: Math.max(profile.onboardingStep, step) }, auditContext);
  return getOnboardingStatus(userId);
};

export const completeOnboarding = async (userId: string, auditContext?: { requestId?: string; ipAddress?: string }) => {
  const profile = await getOrCreateProfile(userId);
  profile.onboardingStep = 4;
  profile.onboardingCompleted = profile.completionScore >= 70 && profile.availability.length > 0 && Boolean(profile.targetRole);
  await profile.save();
  return updateMyProfile(userId, { onboardingStep: profile.onboardingStep, onboardingCompleted: profile.onboardingCompleted }, auditContext);
};

export const getOnboardingStatus = async (userId: string) => {
  const profile = await getOrCreateProfile(userId);
  return {
    step: profile.onboardingStep,
    completionScore: profile.completionScore,
    completed: profile.onboardingCompleted,
    missing: [
      !profile.targetRole ? "targetRole" : null,
      (profile.skillTags?.length ?? 0) === 0 ? "skillTags" : null,
      (profile.availability?.length ?? 0) === 0 ? "availability" : null,
    ].filter(Boolean),
  };
};
