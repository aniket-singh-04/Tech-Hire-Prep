import { Router, type Router as ExpressRouter } from "express";
import { validateBody } from "../common/validation.middleware.js";
import { walletBalanceController, walletEarnController, walletLedgerController, walletRedeemController, walletSpendController } from "../controllers/wallet.controller.js";
import { requireAuth } from "../modules/auth/auth.middleware.js";
import { walletMutationSchema } from "../modules/wallet/wallet.schemas.js";

const walletRoute: ExpressRouter = Router();

walletRoute.use(requireAuth);
walletRoute.get("/balance", walletBalanceController);
walletRoute.get("/ledger", walletLedgerController);
walletRoute.post("/earn", validateBody(walletMutationSchema), walletEarnController);
walletRoute.post("/spend", validateBody(walletMutationSchema), walletSpendController);
walletRoute.post("/redeem", validateBody(walletMutationSchema), walletRedeemController);

export default walletRoute;

