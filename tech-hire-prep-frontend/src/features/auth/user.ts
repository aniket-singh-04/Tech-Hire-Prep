import type { AuthUser, UserRole } from "./types";

const normalizeRole = (role: unknown): UserRole | null => {
  if (!role) return null;
  const normalized = String(role).toUpperCase();
  if (normalized === "STUDENT" || normalized === "ADMIN") {
    return normalized as UserRole;
  }
  return null;
};

export const mapAuthUser = (payload: any): AuthUser | null => {
  const role = normalizeRole(payload?.role);
  if (!role) return null;

  return {
    ...payload,
    id: payload._id ?? payload.id,
    role,
  };
};