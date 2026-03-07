import express from "express";
import * as paymentController from "../controllers/paymentController.js";
import { checkPaymeToken } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post(
  "/payme/callback",
  checkPaymeToken,
  paymentController.handlePaymeCallback,
);
router.get("/payment-status/:orderId", paymentController.getPaymentStatus);

export default router;
