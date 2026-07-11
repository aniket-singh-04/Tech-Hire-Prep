import type {
  EditorTemplate,
  FeedbackPayload,
  InterviewRequest,
  Session,
  WalletLedger,
} from "../types";
import { api } from "../utils/api";

export const matchApi = {
  requestMatch: (
    payload: {
      targetRole?: string;
      skillTags?: string[];
      experienceLevel?: number;
      notes?: string;
    }
  ) => api.post<InterviewRequest>("/matches/request", payload),

  getQueueStatus: () =>
    api.get<InterviewRequest>("/matches/queue-status"),

  cancelMatch: () =>
    api.post<void>("/matches/cancel"),

  getAvailableSlots: () =>
    api.get<{
      slots: Array<{
        day: string;
        start: string;
        end: string;
        timezone: string;
        startsAt: string;
      }>;
    }>("/matches/available-slots"),
};

export const sessionApi = {
  schedule: (payload: {
    sessionId?: string;
    requestId?: string;
    scheduledAt: string;
  }) => api.post<Session>("/sessions/schedule", payload),

  getUpcoming: () =>
    api.get<Session[]>("/sessions/upcoming"),

  getHistory: () =>
    api.get<Session[]>("/sessions/history"),

  getById: (sessionId: string) =>
    api.get<Session>(`/sessions/${sessionId}`),

  join: (sessionId: string) =>
    api.post<{
      session: Session;
      roomId: string;
      editor: Session["editor"];
    }>(`/sessions/${sessionId}/join`),

  leave: (sessionId: string) =>
    api.post<void>(`/sessions/${sessionId}/leave`),

  start: (sessionId: string) =>
    api.post<Session>(`/sessions/${sessionId}/start`),

  end: (sessionId: string) =>
    api.post<Session>(`/sessions/${sessionId}/end`),

  cancel: (sessionId: string) =>
    api.post<Session>(`/sessions/${sessionId}/cancel`),

  reconnect: (sessionId: string) =>
    api.post<{
      session: Session;
      pendingSignals: unknown[];
      editor: Session["editor"];
    }>(`/sessions/${sessionId}/reconnect`),

  rate: (sessionId: string, rating: number) =>
    api.post<void>(`/sessions/${sessionId}/rate`, { rating }),

  submitFeedback: (
    sessionId: string,
    payload: FeedbackPayload
  ) => api.post<void>(`/sessions/${sessionId}/feedback`, payload),

  report: (sessionId: string, reason: string) =>
    api.post<void>(`/sessions/${sessionId}/report`, { reason }),
};

export const walletApi = {
  getBalance: () =>
    api.get<{ balance: number }>("/wallet/balance"),

  getLedger: () =>
    api.get<WalletLedger>("/wallet/ledger"),
};

export const editorApi = {
  getTemplates: () =>
    api.get<EditorTemplate[]>("/editor/templates"),

  getSession: (sessionId: string) =>
    api.get<Session["editor"]>(`/editor/session/${sessionId}`),

  save: (
    sessionId: string,
    payload: { language: string; code: string }
  ) => api.post<void>(`/editor/session/${sessionId}/save`, payload),

  run: (
    sessionId: string,
    payload: { language: string; code: string }
  ) =>
    api.post<{
      output: string;
      error?: string;
      exitCode: number;
    }>(`/editor/session/${sessionId}/run`, payload),

  reset: (sessionId: string, language: string) =>
    api.post<void>(`/editor/session/${sessionId}/reset`, { language }),
};