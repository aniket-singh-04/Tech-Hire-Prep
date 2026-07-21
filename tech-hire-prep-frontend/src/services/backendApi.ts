import { api } from "../utils/api";
import type { EditorTemplate, FeedbackPayload, PointTransaction, Profile, Session, WalletLedger } from "../types";
import type { MatchRequestInput } from "../types/match.types";

const withQuery = (path: string, query: Record<string, string | number | undefined>) => {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (value !== undefined && value !== null) params.set(key, String(value));
  }
  const qs = params.toString();
  return qs ? `${path}?${qs}` : path;
};

const unwrapData = <T,>(response: any): T => {
  console.log(response)
  return response?.data ?? response};



const toIso = (value?: string | Date | null) => (value ? new Date(value).toISOString() : undefined);

const normalizeMatchRequest = (request: any) => {
  if (!request) return request;
  const sessionId = request.sessionId ?? request.interviewSessionId;
  return {
    requestId: String(request.requestId ?? request._id ?? request.id),
    status: request.status,
    sessionId: sessionId ? String(sessionId) : undefined,
    expiresAt: toIso(request.expiresAt ?? request.expirationTimestamp),
    requesterId: request.requesterId ? String(request.requesterId) : request.userId ? String(request.userId) : undefined,
    requesterName: request.requesterName ?? undefined,
    interviewType: request.interviewType ?? undefined,
    preferredRole: request.preferredRole ?? undefined,
    difficulty: request.difficulty ?? undefined,
    preferredLanguage: request.preferredLanguage ?? undefined,
    duration: request.duration ?? undefined,
    description: request.description ?? undefined,
    requesterHeadline: request.requesterHeadline ?? undefined,
  };
};

const normalizeSession = (session: any): Session => {
  const participants = Array.isArray(session?.participants)
    ? session.participants.map((participant: any) => ({
      ...participant,
      userId: String(participant.userId ?? ""),
      joinedAt: toIso(participant.joinedAt),
      leftAt: toIso(participant.leftAt),
      feedbackSubmitted: Boolean(participant.feedbackSubmitted),
    }))
    : [
      {
        userId: String(session?.intervieweeId ?? session?.candidateId ?? session?.interviewee ?? ""),
        role: "candidate",
        joinedAt: toIso(session?.intervieweeJoinedAt),
        leftAt: toIso(session?.intervieweeLeftAt),
        feedbackSubmitted: Boolean(session?.feedbackEntries?.some((entry: any) => String(entry.userId) === String(session?.intervieweeId))),
      },
      {
        userId: String(session?.interviewerId ?? ""),
        role: "interviewer",
        joinedAt: toIso(session?.interviewerJoinedAt),
        leftAt: toIso(session?.interviewerLeftAt),
        feedbackSubmitted: Boolean(session?.feedbackEntries?.some((entry: any) => String(entry.userId) === String(session?.interviewerId))),
      },
    ];


  const resolveId = session?.id ?? session?._id ?? session?.sessionId ?? "";
  const fallbackRequestIds = Array.isArray(session?.requestIds)
    ? session.requestIds
    : [session?.matchId?._id ?? session?.matchId ?? session?.requesterId ?? session?.sessionId ?? " "];

  return {
    id: String(resolveId),
    requestIds: fallbackRequestIds,
    participants,
    status: session?.status,
    scheduledAt: toIso(session?.scheduledAt ?? session?.startTime ?? session?.createdAt),
    startedAt: toIso(session?.startedAt ?? session?.startTime),
    endedAt: toIso(session?.endedAt ?? session?.endTime),
    roomId: session?.roomId,
    editor: session?.editor ?? {
      language: session?.language ?? "javascript",
      code: session?.code ?? "",
      version: 1,
      lastUpdatedBy: session?.updatedBy,
      lastUpdatedAt: toIso(session?.updatedAt),
    },
    scorecard: session?.scorecard,
    reports: Array.isArray(session?.reports)
      ? session.reports.map((report: any) => ({
        userId: report.userId,
        reason: report.reason,
        createdAt: toIso(report.createdAt) ?? new Date().toISOString(),
      }))
      : [],
    ratingSummary: session?.ratingSummary ?? {
      averageRating: session?.ratingCount ? Number(((session.ratingTotal ?? 0) / session.ratingCount).toFixed(2)) : 0,
      count: session?.ratingCount ?? 0,
    },
  };
};

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
    api.get<any>(`/api/v1/user/profile/${username}`).then(unwrapData),
  getMe: () => api.get<any>("/api/v1/user/me").then(unwrapData),
  updateMe: (
    payload: Partial<
      Pick<Profile, | "headline" | "bio" | "targetRole" | "skills" | "experienceLevel" | "college" | "branch" | "graduationYear" | "socialLinks" | "preferences">
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
  requestMatch: (payload: MatchRequestInput) =>
    api.post<any>("/api/v1/match/request", payload).then((response) => normalizeMatchRequest(unwrapData(response))),
  getQueueStatus: () => api.get<any>("/api/v1/match/active").then((response) => normalizeMatchRequest(unwrapData(response))),
  cancelMatch: () => api.post<any>("/api/v1/match/cancel").then(unwrapData),
  acceptMatch: (requestId: string) =>
    api.post<any>(`/api/v1/match/${requestId}/accept`).then((response) => normalizeSession(unwrapData(response))),
  rejectMatch: (requestId: string) =>
    api.post<any>(`/api/v1/match/${requestId}/reject`).then(unwrapData),
};

export const sessionApi = {
  schedule: (payload: { sessionId: string; startTime: string; endTime: string }) =>
    api.post<any>("/api/v1/session/schedule", payload).then((response) => normalizeSession(unwrapData(response))),
  getUpcoming: () => api.get<any>("/api/v1/session/upcoming").then((response) => {
    const data = unwrapData<any>(response);
    return Array.isArray(data) ? data.map(normalizeSession) : [];
  }),
  getHistory: () => api.get<any>("/api/v1/session/history").then((response) => {
    const data = unwrapData<any>(response);
    return Array.isArray(data) ? data.map(normalizeSession) : [];
  }),
  getById: (sessionId: string) => api.get<any>(`/api/v1/session/${sessionId}`).then((response) => normalizeSession(unwrapData(response))),
  reschedule: (sessionId: string, payload: { startTime: string; endTime: string }) =>
    api.patch<any>(`/api/v1/session/${sessionId}/reschedule`, payload).then((response) => normalizeSession(unwrapData(response))),
  join: (sessionId: string) => api.post<any>(`/api/v1/session/${sessionId}/join`).then((response) => normalizeSession(unwrapData(response))),
  leave: (sessionId: string) => api.post<any>(`/api/v1/session/${sessionId}/leave`).then((response) => normalizeSession(unwrapData(response))),
  reconnect: (sessionId: string) => api.post<any>(`/api/v1/session/${sessionId}/reconnect`).then((response) => normalizeSession(unwrapData(response))),
  cancel: (sessionId: string) => api.post<any>(`/api/v1/session/${sessionId}/cancel`).then((response) => normalizeSession(unwrapData(response))),
  rate: (sessionId: string, rating: number) =>
    api.post<any>(`/api/v1/session/${sessionId}/rate`, { rating }).then((response) => normalizeSession(unwrapData(response))),
  submitFeedback: (sessionId: string, payload: FeedbackPayload) =>
    api.post<any>(`/api/v1/session/${sessionId}/feedback`, payload).then((response) => normalizeSession(unwrapData(response))),
  report: (sessionId: string, reason: string) =>
    api.post<any>(`/api/v1/session/${sessionId}/report`, { reason }).then((response) => normalizeSession(unwrapData(response))),
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
  createToken: (payload: { roomId?: string; sessionId?: string }) =>
    api.post("/api/v1/webrtc/token", payload),
  createRoom: (payload: { roomId?: string; sessionId?: string }) =>
    api.post("/api/v1/webrtc/room", payload),
  sendIceCandidate: (payload: {
    roomId: string;
    sessionId?: string;
    candidate?: unknown;
    offer?: unknown;
    answer?: unknown;
  }) => api.post("/api/v1/webrtc/ice-candidate", payload),
};

