import express from "express";
import premiumController from "../controllers/premiumController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

// All routes require authentication
router.use(authMiddleware);

// 0. Daily Analysis
router.get("/:userId/daily-analysis", premiumController.getDailyAnalysis);

// 1. Flow Statistics
router.get("/:userId/flow-statistics", premiumController.getFlowStatistics);

// 2. Unlimited Upload Access
router.get(
  "/:userId/unlimited-upload",
  premiumController.checkUnlimitedUploadAccess,
);

// 3. AI Recommendations
router.get(
  "/:userId/ai-recommendations",
  premiumController.getAIRecommendations,
);

// 4. Priority Support Status
router.get(
  "/:userId/priority-support",
  premiumController.getPrioritySupportStatus,
);

// 5. Macro Nutrient Analysis
router.get("/:userId/macro-analysis", premiumController.getMacroAnalysis);

// Get all user premium features
router.get("/:userId/features", premiumController.getUserPremiumFeatures);

export default router;
