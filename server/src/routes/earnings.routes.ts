import { Router } from "express";
import { verifyToken } from "../middleware/auth.js";
import {
  getEarnings,
  getEarningsHistory,
} from "../controllers/earnings.controller.js";

const router = Router();

// All routes require authentication
router.use(verifyToken);

router.get("/", getEarnings);
router.get("/history", getEarningsHistory);

export default router;
