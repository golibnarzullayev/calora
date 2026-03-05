import { Router } from "express";
import { UserController } from "../controllers/UserController.js";

const router = Router();

router.post("/", UserController.createOrUpdateUser);
router.get("/:userId", UserController.getUser);
router.get("/telegram/:telegramId", UserController.getUserWithTelegramId);
router.patch("/:userId/weight", UserController.updateWeight);

export default router;
