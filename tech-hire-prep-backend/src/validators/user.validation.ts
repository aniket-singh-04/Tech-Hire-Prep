import { ExperienceLevel, PreferredLanguage, TargetRole, WeekDay } from "../types/profile.types.ts";
import { UserRepository } from "../repositories/user.repository.ts";
import { AppError } from "../utils/appError.ts";
import z from "zod";

const time24HourSchema = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Time must be in 24-hour HH:mm format.");

export const assertUniqueUserEmail = async (email: string, excludeUserId?: string) => {
    const existingUser = await UserRepository.existsByEmail(
        email
    );
    if (existingUser) throw new AppError("Email already exists.", 400);
};

export const profileUpdateSchema = z.object({
    headline: z.string().trim().max(120).optional(),
    bio: z.string().trim().max(500).optional(),
    college: z.string().trim().optional(),
    branch: z.string().trim().max(50).optional(),
    graduationYear: z.number().int().min(2000).max(2060).optional(),

    targetRole: z.enum(TargetRole).optional(),
    experienceLevel: z.enum(ExperienceLevel).optional(),

    skills: z.array(z.string().trim().min(1).max(40)).max(30).optional(),

    socialLinks: z.object({
        github: z.url().optional(),
        linkedin: z.url().optional(),
        portfolio: z.url().optional(),
        leetcode: z.url().optional(),
        codeforces: z.url().optional(),
        codechef: z.url().optional(),
        geeksforgeeks: z.url().optional(),
        hackerEarth: z.url().optional(),
        hackerRank: z.url().optional(),
    }).optional(),

    preferences: z.object({
        language: z.enum(PreferredLanguage).optional(),
        notifications: z.object({
            email: z.boolean().optional(),
        }).optional(),
    }).optional(),

    availability: z.array(
        z.object({
            day: z.enum(WeekDay),
            startTime: time24HourSchema,
            endTime: time24HourSchema,
        })
    ).optional(),
}).strict();

export const createAvatarUploadUrlSchema = z.object({
    fileName: z.string().trim().min(1, "fileName is required"),
    contentType: z.string().trim().min(1, "contentType is required"),
}).strict();

export const saveAvatarSchema = z.object({
    s3Key: z.string().trim().min(1, "s3Key is required"),
}).strict();

export const availabilityUpdateSchema = z.object({
    availability: z.array(
        z.object({
            day: z.enum(WeekDay),
            startTime: time24HourSchema,
            endTime: time24HourSchema,
        })
    ),
}).strict();

export type SaveAvatarDto = z.infer<typeof saveAvatarSchema>;
export type UpdateAvailabilityDto = z.infer<typeof availabilityUpdateSchema>;



