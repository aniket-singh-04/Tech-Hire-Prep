import { z } from "zod";
import { UserRole } from "../types/user.types.ts";


const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,64}$/;

export const registerSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Name must be at least 2 characters.")
    .max(80, "Name cannot exceed 80 characters."),

  email: z
    .email("Please enter a valid email address."),

  password: z
    .string()
    .min(8, "Password must be at least 8 characters.")
    .max(64, "Password cannot exceed 64 characters.")
    .regex(PASSWORD_REGEX, "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character.",),

  role: z
    .enum(UserRole)
    .optional(),
}).strict();

export const verifyOtpSchema = z.object({
  challengeId: z.string().min(1, "challengeId is required"),
  otp: z
    .string()
    .trim()
    .regex(/^[0-9]{4,6}$/, "OTP must be 4 to 6 digits"),

}).strict();

export const loginSchema = z.object({
  email: z.email("Invalid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters.")
    .max(64, "Password cannot exceed 64 characters.")
    .regex(PASSWORD_REGEX, "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character.",),
}).strict();

export const forgotPasswordSchema = z.object({
  email: z.email("Invalid email address"),
}).strict();

export const confirmPasswordChangeSchema = z.object({
  challengeId: z.string().min(1, "challengeId is required"),
  otp: z
    .string()
    .trim()
    .regex(/^[0-9]{4,6}$/, "OTP must be 4 to 6 digits"),
  newPassword: z.string().min(6, "Password must be at least 6 characters"),
}).strict();

export const confirmEmailVerificationSchema = z.object({
  userId: z.string().min(1, "userId is required"),
  token: z.string().min(1, "token is required"),
}).strict();

export const userIdParamsSchema = z.object({
  userId: z.string().regex(/^[a-f\d]{24}$/i),
}).strict();

export type RegisterInput = z.infer<typeof registerSchema>;
export type VerifyOtp = z.infer<typeof verifyOtpSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type PasswordChangeInput = z.infer<typeof confirmPasswordChangeSchema>;
export type EmailVerificationInput = z.infer<typeof confirmEmailVerificationSchema>;