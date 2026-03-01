import { Router } from "express";
import multer from "multer";
import { MealController } from "../controllers/MealController";

const upload = multer({ dest: "uploads/" });

const router = Router();

router.post(
  "/:userId/upload",
  upload.single("image"),
  MealController.uploadMeal,
);
router.get("/:userId/today", MealController.getTodayMeals);
router.get("/:userId/by-date", MealController.getMealsByDate);
router.delete("/:mealId", MealController.deleteMeal);

export default router;
