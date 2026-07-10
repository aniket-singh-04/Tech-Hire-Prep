import { Router, type Router as ExpressRouter } from "express";
import { protect } from "../middlewares/auth.middleare.ts";
import { cancelSubscriptionController, createOrderController, getPaymentDetailsController, getPaymentHistoryController, handleWebhookController, subscribeController, subscriptionStatusController, verifyPaymentController } from "../controllers/payment.controller.ts";
import { validateBody, validateParams, validateQuery } from "../middlewares/validation.middleware.ts";
import { cancelSubscriptionSchema, createOrderSchema, paymentHistoryQuerySchema, paymentIdParamsSchema, subscribeSchema, verifyPaymentSchema } from "../validators/payment.validation.ts";

const paymentRoute: ExpressRouter = Router();

// Webhook is called by Razorpay, so no protect middleware
paymentRoute.post("/webhook", handleWebhookController);

// All following routes require authentication
paymentRoute.use(protect);

// Payments
paymentRoute.post("/create-order", validateBody(createOrderSchema), createOrderController);
paymentRoute.post("/verify", validateBody(verifyPaymentSchema), verifyPaymentController);
paymentRoute.get("/history", validateQuery(paymentHistoryQuerySchema), getPaymentHistoryController);
paymentRoute.get("/:paymentId", validateParams(paymentIdParamsSchema), getPaymentDetailsController);

// Subscriptions
paymentRoute.post("/subscriptions/subscribe", validateBody(subscribeSchema), subscribeController);
paymentRoute.post("/subscriptions/cancel", validateBody(cancelSubscriptionSchema), cancelSubscriptionController);
paymentRoute.get("/subscriptions/status", subscriptionStatusController);

export default paymentRoute;
