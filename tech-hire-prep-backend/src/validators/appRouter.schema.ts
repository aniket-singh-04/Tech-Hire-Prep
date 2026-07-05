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

export type RegisterInput = z.infer<typeof registerSchema>;
export type VerifyRegisterOtp = z.infer<typeof verifyOtpSchema>;