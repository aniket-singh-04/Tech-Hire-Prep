import { Router, type Router as ExpressRouter } from "express";
import { validateBody } from "../common/validation.middleware.js";
import { onboardingComplete, onboardingStatus, onboardingStepOne, onboardingStepThree, onboardingStepTwo } from "../controllers/onboarding.controller.js";
import { requireAuth } from "../modules/auth/auth.middleware.js";
import { onboardingStepOneSchema, onboardingStepThreeSchema, onboardingStepTwoSchema } from "../modules/profile/profile.schemas.js";

const onboardingRoute: ExpressRouter = Router();

onboardingRoute.use(requireAuth);
onboardingRoute.post("/step-1", validateBody(onboardingStepOneSchema), onboardingStepOne);
onboardingRoute.post("/step-2", validateBody(onboardingStepTwoSchema), onboardingStepTwo);
onboardingRoute.post("/step-3", validateBody(onboardingStepThreeSchema), onboardingStepThree);
onboardingRoute.post("/complete", onboardingComplete);
onboardingRoute.get("/status", onboardingStatus);

export default onboardingRoute;

