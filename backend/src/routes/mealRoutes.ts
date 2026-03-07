import { Router } from "express";
import multer from "multer";
import { MealController } from "../controllers/MealController.js";
import { subscriptionRequiredMiddleware } from "../middleware/authMiddleware.js";

const upload = multer({ dest: "uploads/" });

const router = Router();

router.post(
  "/:userId/upload",
  subscriptionRequiredMiddleware,
  upload.single("image"),
  MealController.uploadMeal,
);
router.get("/:userId/today", MealController.getTodayMeals);
router.get("/:userId/by-date", MealController.getMealsByDate);
router.delete("/:mealId", MealController.deleteMeal);

export default router;
