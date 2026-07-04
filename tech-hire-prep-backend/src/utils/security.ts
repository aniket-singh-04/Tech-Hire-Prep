import crypto from "crypto";

export const normalizeEmail = (email: string): string => {
  return email.trim().toLowerCase();
};

export const sha256 = (value: string) =>
  crypto.createHash("sha256").update(value).digest("hex");
