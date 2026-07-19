import crypto from "crypto";
import { AppError } from "./appError.ts";
import { InterviewSessionStatus } from "../models/interviewSession.model.ts";

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


export const ensureSessionTimeActive = (session: any) => {
  const now = new Date();
  if (!session.startTime || !session.endTime) {
    throw new AppError("This interview session is not scheduled.", 400);
  }
  if (now < session.startTime || now > session.endTime) {
    throw new AppError("This interview session is not currently active.", 400);
  }
};

export const ensureJoinable = (session: any) => {
  if ([InterviewSessionStatus.COMPLETED, InterviewSessionStatus.CANCELLED].includes(session.status)) {
    throw new AppError("This session can no longer be joined.", 400);
  }
};