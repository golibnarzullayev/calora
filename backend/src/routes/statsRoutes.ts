import { Router } from "express";
import { StatsController } from "../controllers/StatsController";

const router = Router();

router.get("/:userId/daily", StatsController.getDailyStats);
router.get("/:userId/weekly", StatsController.getWeeklyStats);
router.get("/:userId/monthly", StatsController.getMonthlyStats);
router.post("/:userId/weight", StatsController.recordWeight);
router.get("/:userId/weight-progress", StatsController.getWeightProgress);

export default router;
