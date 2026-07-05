import crypto from "crypto";

export const normalizeEmail = (email: string): string => {
  return email.trim().toLowerCase();
};

export const sha256 = (value: string) =>
  crypto.createHash("sha256").update(value).digest("hex");


export const generateOpaqueToken = (
  bytes = 48,
): string => {
  return crypto.randomBytes(bytes).toString("hex");
};

export const maskEmail = (email: string) => {
  const [localPart, domain] = email.split("@");
  if (!localPart || !domain) return email;

  if (localPart.length <= 2) {
    return `${localPart[0] ?? "*"}*@${domain}`;
  }

  return `${localPart[0]}${"*".repeat(Math.max(localPart.length - 2, 1))}${localPart.slice(-1)}@${domain}`;
};