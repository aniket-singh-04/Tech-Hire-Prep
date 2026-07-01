import { sendSuccess } from "../common/http.js";
import { earnPoints, getWalletBalance, getWalletLedger, redeemPoints, spendPoints } from "../services/wallet.service.js";
import { asyncHandler } from "../utils/asyncHander.js";

export const walletBalanceController = asyncHandler(async (req, res) => {
  sendSuccess(res, { balance: await getWalletBalance(req.user!.id) });
});

export const walletLedgerController = asyncHandler(async (req, res) => {
  sendSuccess(res, await getWalletLedger(req.user!.id));
});

export const walletEarnController = asyncHandler(async (req, res) => {
  sendSuccess(res, await earnPoints(req.user!.id, req.body.amount, req.body.reason, { requestId: req.requestId, ipAddress: req.ip }), 201);
});

export const walletSpendController = asyncHandler(async (req, res) => {
  sendSuccess(res, await spendPoints(req.user!.id, req.body.amount, req.body.reason, { requestId: req.requestId, ipAddress: req.ip }), 201);
});

export const walletRedeemController = asyncHandler(async (req, res) => {
  sendSuccess(res, await redeemPoints(req.user!.id, req.body.amount, req.body.reason, { requestId: req.requestId, ipAddress: req.ip }), 201);
});
