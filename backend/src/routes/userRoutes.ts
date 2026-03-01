import { Router } from "express";
import { UserController } from "../controllers/UserController";

const router = Router();

router.post("/", UserController.createOrUpdateUser);
router.get("/:userId", UserController.getUser);
router.patch("/:userId/weight", UserController.updateWeight);

export default router;
