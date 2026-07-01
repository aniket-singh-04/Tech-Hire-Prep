import { sendSuccess } from "../common/http.js";
import { completeOnboarding, getOnboardingStatus, submitOnboardingStep } from "../services/onboarding.service.js";
import { asyncHandler } from "../utils/asyncHander.js";

export const onboardingStepOne = asyncHandler(async (req, res) => {
  sendSuccess(res, await submitOnboardingStep(req.user!.id, 1, req.body, { requestId: req.requestId, ipAddress: req.ip }));
});

export const onboardingStepTwo = asyncHandler(async (req, res) => {
  sendSuccess(res, await submitOnboardingStep(req.user!.id, 2, req.body, { requestId: req.requestId, ipAddress: req.ip }));
});

export const onboardingStepThree = asyncHandler(async (req, res) => {
  sendSuccess(res, await submitOnboardingStep(req.user!.id, 3, req.body, { requestId: req.requestId, ipAddress: req.ip }));
});

export const onboardingComplete = asyncHandler(async (req, res) => {
  sendSuccess(res, await completeOnboarding(req.user!.id, { requestId: req.requestId, ipAddress: req.ip }));
});

export const onboardingStatus = asyncHandler(async (req, res) => {
  sendSuccess(res, await getOnboardingStatus(req.user!.id));
});
