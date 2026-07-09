import type { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler.ts";
import { requestMatchService } from "../services/match.service.ts";
import { created } from "../common/response.ts";

export const requestMatchController = asyncHandler(async (req: Request, res: Response) => {
  const result = await requestMatchService({ userId: req.user!.id, data: req.body, });

  return created(res, result, "Your interview request were created.");
}
);

// export const getQueueStatusController = asyncHandler(
//   async (req: Request, res: Response) => {
//     const result = await getQueueStatusService(req.user.id);

//     return res.status(200).json(result);
//   }
// );

// export const cancelMatchController = asyncHandler(
//   async (req: Request, res: Response) => {
//     const result = await cancelMatchService(req.user.id);

//     return res.status(200).json(result);
//   }
// );

// export const getAvailableSlotsController = asyncHandler(
//   async (req: Request, res: Response) => {
//     const result = await getAvailableSlotsService({
//       userId: req.user.id,
//       query: req.query,
//     });

//     return res.status(200).json(result);
//   }
// );
