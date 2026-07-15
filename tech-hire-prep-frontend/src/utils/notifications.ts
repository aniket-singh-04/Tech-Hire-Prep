import { ApiError } from "./api";

export const getErrorMessage = (
  error: unknown,
  fallback = "Something went wrong.",
) => {
  if (error instanceof ApiError) {
    return error.message || fallback;
  }

  if (error instanceof Error) {
    return error.message || fallback;
  }

  if (typeof error === "string" && error.trim()) {
    return error;
  }

  return fallback;
};
