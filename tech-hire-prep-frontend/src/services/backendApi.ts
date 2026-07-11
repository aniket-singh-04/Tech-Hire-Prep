import { api } from "../utils/api";
import type { EditorTemplate, FeedbackPayload, PointTransaction, Profile, Session, WalletLedger } from "../types";

const withQuery = (path: string, query: Record<string, string | number | undefined>) => {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (value !== undefined && value !== null) params.set(key, String(value));
  }
  const qs = params.toString();
  return qs ? `${path}?${qs}` : path;
};


const unwrapData = <T,>(response: any): T => response?.data ?? response;

export const authApi = {
  register: (payload: { name: string; email: string; password: string }) =>
    api.post("/api/v1/auth/register", payload).then(unwrapData),
  verifyRegisterOtp: (payload: { challengeId: string; otp: string }) =>
    api.post("/api/v1/auth/register/verify-otp", payload).then(unwrapData),
  login: (payload: { email: string; password: string }) =>
    api.post("/api/v1/auth/login", payload).then(unwrapData),
  verifyLoginOtp: (payload: { challengeId: string; otp: string }) =>
    api.post("/api/v1/auth/login/verify-otp", payload).then(unwrapData),
  forgotPassword: (payload: { email: string }) =>
    api.post("/api/v1/auth/forgot-password", payload).then(unwrapData),
  resetPassword: (payload: { userId: string; token: string; password: string }) =>
    api.post("/api/v1/auth/reset-password", payload).then(unwrapData),
  requestPasswordChangeOtp: () =>
    api.post("/api/v1/auth/password-change/request-otp").then(unwrapData),
  confirmPasswordChange: (payload: { challengeId: string; otp: string; newPassword: string }) =>
    api.post("/api/v1/auth/password-change/confirm", payload).then(unwrapData),
  requestEmailVerification: () =>
    api.post("/api/v1/auth/verify-email/request").then(unwrapData),
  confirmEmailVerification: (payload: { userId: string; token: string }) =>
    api.post("/api/v1/auth/verify-email/confirm", payload).then(unwrapData),
  me: () => api.get<any>("/api/v1/auth/me").then(unwrapData),
  refresh: () => api.post<any>("/api/v1/auth/refresh").then(unwrapData),
  logout: () => api.post<any>("/api/v1/auth/logout").then(unwrapData),
};

export const profileApi = {
  getPublicProfile: (username: string) =>
    api.get<any>(`/api/v1/user/${username}`).then(unwrapData),
  getMe: () => api.get<any>("/api/v1/user/me").then(unwrapData),
  updateMe: (
    payload: Partial<
      Pick<
        Profile,
        | "headline"
        | "bio"
        | "targetRole"
        | "skillTags"
        | "experienceLevel"
        | "college"
        | "graduationYear"
      >
    >,
  ) => api.patch<any>("/api/v1/user/me", payload).then(unwrapData),
  createAvatarUploadUrl: (payload: { fileName: string; contentType: string }) =>
    api.post<any>("/api/v1/user/me/avatar/presign", payload).then(unwrapData),
  saveAvatar: (payload: { s3Key: string }) =>
    api.patch<any>("/api/v1/user/me/avatar", payload).then(unwrapData),
  updateAvailability: (payload: Profile["availability"]) =>
    api.patch<any>("/api/v1/user/me/availability", { availability: payload }).then(unwrapData),
  deleteMe: () => api.delete<any>("/api/v1/user/me").then(unwrapData),
};

export const matchApi = {
  requestMatch: (payload: Record<string, unknown>) =>
    api.post<any>("/api/v1/match/request", payload).then(unwrapData),
  getQueueStatus: () => api.get<any>("/api/v1/match/active").then(unwrapData),
  cancelMatch: () => api.post<any>("/api/v1/match/cancel").then(unwrapData),
  acceptMatch: (requestId: string) =>
    api.post<any>(`/api/v1/match/${requestId}/accept`).then(unwrapData),
  rejectMatch: (requestId: string) =>
    api.post<any>(`/api/v1/match/${requestId}/reject`).then(unwrapData),
};

export const sessionApi = {
  schedule: (payload: { matchId: string; startTime: string; endTime: string }) =>
    api.post<any>("/api/v1/session/schedule", payload).then(unwrapData),
  getUpcoming: () => api.get<any>("/api/v1/session/upcoming").then(unwrapData),
  getHistory: () => api.get<any>("/api/v1/session/history").then(unwrapData),
  getById: (sessionId: string) => api.get<any>(`/api/v1/session/${sessionId}`).then(unwrapData),
  reschedule: (sessionId: string, payload: { startTime: string; endTime: string }) =>
    api.patch<any>(`/api/v1/session/${sessionId}/reschedule`, payload).then(unwrapData),
  join: (sessionId: string) => api.post<any>(`/api/v1/session/${sessionId}/join`).then(unwrapData),
  leave: (sessionId: string) => api.post<any>(`/api/v1/session/${sessionId}/leave`).then(unwrapData),
  start: (sessionId: string) => api.post<any>(`/api/v1/session/${sessionId}/start`).then(unwrapData),
  end: (sessionId: string) => api.post<any>(`/api/v1/session/${sessionId}/end`).then(unwrapData),
  reconnect: (sessionId: string) => api.post<any>(`/api/v1/session/${sessionId}/reconnect`).then(unwrapData),
  cancel: (sessionId: string) => api.post<any>(`/api/v1/session/${sessionId}/cancel`).then(unwrapData),
  rate: (sessionId: string, rating: number) =>
    api.post<any>(`/api/v1/session/${sessionId}/rate`, { rating }).then(unwrapData),
  submitFeedback: (sessionId: string, payload: FeedbackPayload) =>
    api.post<any>(`/api/v1/session/${sessionId}/feedback`, payload).then(unwrapData),
  report: (sessionId: string, reason: string) =>
    api.post<any>(`/api/v1/session/${sessionId}/report`, { reason }).then(unwrapData),
};

export const editorApi = {
  getTemplates: () => api.get<EditorTemplate[]>("/api/v1/editor/templates"),
  getSession: (sessionId: string) =>
    api.get<Session["editor"]>(`/api/v1/editor/session/${sessionId}`),
  save: (sessionId: string, payload: { language: string; code: string }) =>
    api.post<void>(`/api/v1/editor/session/${sessionId}/save`, payload),
  run: (
    sessionId: string,
    payload: { language: string; code: string; input?: string },
  ) =>
    api.post<{ output: string; error?: string; exitCode: number }>(
      `/api/v1/editor/session/${sessionId}/run`,
      payload,
    ),
  reset: (sessionId: string) =>
    api.post<void>(`/api/v1/editor/session/${sessionId}/reset`, {}),
};

export const walletApi = {
  getBalance: () => api.get<{ balance: number }>("/api/v1/wallet/balance"),
  getLedger: () => api.get<WalletLedger>("/api/v1/wallet/ledger"),
  earn: (payload: { amount: number; description?: string }) =>
    api.post<PointTransaction>("/api/v1/wallet/earn", payload),
  spend: (payload: { amount: number; description?: string }) =>
    api.post<PointTransaction>("/api/v1/wallet/spend", payload),
  redeem: (payload: { amount: number; description?: string }) =>
    api.post<PointTransaction>("/api/v1/wallet/redeem", payload),
};

export const paymentApi = {
  createOrder: (payload: { sessionId?: string; metadata?: Record<string, unknown> }) =>
    api.post("/api/v1/payments/create-order", payload),
  verify: (payload: {
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
  }) => api.post("/api/v1/payments/verify", payload),
  getHistory: (payload: { limit?: number; page?: number } = {}) =>
    api.get(withQuery("/api/v1/payments/history", payload)),
  getById: (paymentId: string) => api.get(`/api/v1/payments/${paymentId}`),
  subscribe: (payload: { planId: string }) =>
    api.post("/api/v1/payments/subscriptions/subscribe", payload),
  cancelSubscription: (payload: { subscriptionId: string }) =>
    api.post("/api/v1/payments/subscriptions/cancel", payload),
  subscriptionStatus: () => api.get("/api/v1/payments/subscriptions/status"),
  webhook: (payload: unknown) => api.post("/api/v1/payments/webhook", payload, { skipRefresh: true }),
};

export const webrtcApi = {
  createToken: (payload: { roomId?: string }) =>
    api.post("/api/v1/webrtc/token", payload),
  createRoom: (payload: { roomId?: string }) =>
    api.post("/api/v1/webrtc/room", payload),
  sendIceCandidate: (payload: {
    roomId: string;
    candidate?: unknown;
    offer?: unknown;
    answer?: unknown;
  }) => api.post("/api/v1/webrtc/ice-candidate", payload),
};


