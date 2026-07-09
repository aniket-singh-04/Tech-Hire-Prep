import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler.ts";
import { ok } from "../common/response.ts";

export const walletBalanceController = asyncHandler(async (req: Request, res: Response) => {
  return ok(res, { balance: 0 }, "Balance fetched successfully");
});

export const walletLedgerController = asyncHandler(async (req: Request, res: Response) => {
  return ok(res, [], "Ledger fetched successfully");
});

export const walletEarnController = asyncHandler(async (req: Request, res: Response) => {
  return ok(res, null, "Earned successfully");
});

export const walletSpendController = asyncHandler(async (req: Request, res: Response) => {
  return ok(res, null, "Spent successfully");
});

export const walletRedeemController = asyncHandler(async (req: Request, res: Response) => {
  return ok(res, null, "Redeemed successfully");
});
