import express from "express";
import * as subscriptionController from "../controllers/subscriptionController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/subscriptions", subscriptionController.getAllSubscriptions);
router.get("/subscriptions/:id", subscriptionController.getSubscriptionById);
router.post("/subscriptions", subscriptionController.createSubscription);
router.put("/subscriptions/:id", subscriptionController.updateSubscription);
router.delete("/subscriptions/:id", subscriptionController.deleteSubscription);

router.get(
  "/user/subscription",
  authMiddleware,
  subscriptionController.getUserActiveSubscription,
);
router.get(
  "/user/subscription-history",
  authMiddleware,
  subscriptionController.getUserSubscriptionHistory,
);
router.get(
  "/user/has-subscription",
  authMiddleware,
  subscriptionController.hasActiveSubscription,
);

router.post("/orders", authMiddleware, subscriptionController.createOrder);
router.get("/orders/:id", authMiddleware, subscriptionController.getOrder);
router.get(
  "/user/orders",
  authMiddleware,
  subscriptionController.getUserOrders,
);

export default router;
