import { Router, type Router as ExpressRouter } from "express";
import { protect } from "../middlewares/auth.middleare.ts";
import { validateBody } from "../middlewares/validation.middleware.ts";


const walletRoute: ExpressRouter = Router();

walletRoute.use(protect);
walletRoute.get("/balance", walletBalanceController);
walletRoute.get("/ledger", walletLedgerController);
walletRoute.post("/earn", validateBody(walletMutationSchema), walletEarnController);
walletRoute.post("/spend", validateBody(walletMutationSchema), walletSpendController);
walletRoute.post("/redeem", validateBody(walletMutationSchema), walletRedeemController);

export default walletRoute;

