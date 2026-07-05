import { Types } from "mongoose";
import { AppError } from "../utils/appError.ts";
import { UserRepository } from "../repositories/user.repository.ts";

export const assertUniqueUserEmail = async (email: string, excludeUserId?: string) => {
    const existingUser = await UserRepository.existsByEmail(
        email
    );
    if (existingUser) throw new AppError("Email already exists.", 400);
};