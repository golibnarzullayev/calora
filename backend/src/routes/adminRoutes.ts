import { Router } from "express";
import { authMiddleware } from "../middleware/authMiddleware.js";
import {
  isAdminMiddleware,
  getAllUsers,
  toggleUserAdmin,
  deleteUser,
  getAllOrders,
  getAdminStats,
  getAllPayments,
} from "../controllers/adminController.js";

const router = Router();

// All admin routes require authentication and admin status
router.use(authMiddleware);
router.use(isAdminMiddleware);

// Users management
router.get("/users/all", getAllUsers);
router.patch("/users/:userId/toggle-admin", toggleUserAdmin);
router.delete("/users/:userId", deleteUser);

// Orders management
router.get("/orders/all", getAllOrders);

// Statistics
router.get("/stats", getAdminStats);

// Payments
router.get("/payments", getAllPayments);

export default router;
