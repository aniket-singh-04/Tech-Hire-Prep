import type { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler.ts";
import { registerService } from "../services/auth.service.ts";
import { created } from "../common/response.ts";



export const register = asyncHandler(
  async (req: Request, res: Response) => {
    const result = await registerService(req.body);

    return created(
      res,
      result,
      "OTP sent successfully."
    );
  },
);