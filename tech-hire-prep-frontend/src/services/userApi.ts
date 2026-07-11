import type { AuthUser } from "../features/auth/types";
import type { OnboardingStatus, Profile } from "../types";
import { api, type ApiSuccessResponse } from "../utils/api";

export const authApi = {
  register: (name: string, email: string, password: string) =>
    api
      .post<ApiSuccessResponse<{ user: AuthUser; accessToken: string }>>( "/api/v1/auth/register", {
        name,
        email,
        password,
      })
      .then((response) => response.data),

  login: (email: string, password: string) =>
    api
      .post<ApiSuccessResponse<{ user: AuthUser; accessToken: string }>>( "/api/v1/auth/login", {
        email,
        password,
      })
      .then((response) => response.data),

  logout: () =>
    api
      .post<ApiSuccessResponse<void>>( "/api/v1/auth/logout")
      .then((response) => response.data),

  refresh: () =>
    api
      .post<ApiSuccessResponse<{ user: AuthUser; accessToken: string }>>( "/api/v1/auth/refresh")
      .then((response) => response.data),
};

export const userApi = {
  getMe: () => api.get<AuthUser>("/users/me"),

  getMyProfile: () => api.get<Profile>("/users/me/profile"),

  updateMe: (
    payload: Partial< Pick < Profile, | "headline" | "bio" | "targetRole" | "skillTags" | "experienceLevel" | "college" | "graduationYear"> >
  ) => api.patch<Profile>("/users/me", payload),

  updateAvatar: (avatarUrl: string) =>
    api.patch("/users/me/avatar", { avatarUrl }),

  updatePreferences: (
    preferences: Partial<Profile["preferences"]>
  ) => api.patch("/users/me/preferences", { preferences }),

  updateAvailability: (
    availability: Profile["availability"]
  ) => api.patch("/users/me/availability", { availability }),

  deleteMe: () => api.delete<void>("/users/me"),
};

export const onboardingApi = {
  getStatus: () =>
    api.get<OnboardingStatus>("/onboarding/status"),

  submitStep1: (payload: {
    targetRole: string;
    college?: string;
    graduationYear?: number;
  }) =>
    api.post<OnboardingStatus>("/onboarding/step-1", payload),

  submitStep2: (payload: {
    skillTags: string[];
    experienceLevel: number;
    preferences?: Partial<Profile["preferences"]>;
  }) =>
    api.post<OnboardingStatus>("/onboarding/step-2", payload),

  submitStep3: (payload: {
    availability: Profile["availability"];
  }) =>
    api.post<OnboardingStatus>("/onboarding/step-3", payload),

  complete: () =>
    api.post<OnboardingStatus>("/onboarding/complete"),
};