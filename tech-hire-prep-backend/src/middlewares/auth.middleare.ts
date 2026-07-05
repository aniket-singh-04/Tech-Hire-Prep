import { NextFunction, Request, Response } from "express";
import { AppError } from "../utils/appError.ts";
import { verifyAccessToken } from "../services/token.service.ts";
import { UserRepository } from "../repositories/user.repository.ts";
import { UserStatus } from "../types/user.types.ts";

export const protect = async (
    req: Request,
    _res: Response,
    next: NextFunction,
) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return next(new AppError("Unauthorized", 401));
        }

        const token = authHeader.split(" ")[1];

        // ✅ CRITICAL GUARD (THIS FIXES THE ERROR)
        if (!token) {
            return next(new AppError("Unauthorized", 401));
        }

        const payload = verifyAccessToken(token);

        const user = await UserRepository.findById(payload.userId);
        if (!user || user.status === UserStatus.DELETED) {
            return next(new AppError("Unauthorized", 401));
        }

        req.user = {
            id: user._id.toString(),
            role: user.role,
        };

        return next();
    } catch (error) {
        return next(error);
    }
};