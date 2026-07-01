import type { RequestHandler } from "express";
import { User, type UserRole } from "../../models/user.model.js";
import { AppError } from "../../utils/appError.js";
import { verifyAccessToken } from "./token.service.js";

export const requireAuth: RequestHandler = async (req, _res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : undefined;
    if (!token) {
      next(new AppError("Unauthorized", 401));
      return;
    }

    const payload = verifyAccessToken(token);
    const user = await User.findById(payload.sub).select("_id role status").lean();
    if (!user || user.status !== "active") {
      next(new AppError("Unauthorized", 401));
      return;
    }

    req.user = { id: user._id.toString(), role: user.role };
    next();
  } catch (error) {
    next(error);
  }
};

export const requireRole = (...roles: UserRole[]): RequestHandler => (req, _res, next) => {
  if (!req.user || !roles.includes(req.user.role)) {
    next(new AppError("Forbidden", 403));
    return;
  }
  next();
};
