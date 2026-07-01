import type { RequestHandler } from "express";
import { User } from "../../models/user.model.js";
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
    const user = await User.findById(payload.sub).select("_id role").lean();
    if (!user) {
      next(new AppError("Unauthorized", 401));
      return;
    }

    req.user = { id: user._id.toString(), role: user.role };
    next();
  } catch (error) {
    next(error);
  }
};
