import { Router } from "express";
import { verifyToken } from "../middleware/auth.js";
import {
  clearAllData,
  getSystemStats,
} from "../controllers/admin.controller.js";

const router = Router();

// All routes require authentication
router.use(verifyToken);

router.delete("/clear-data", clearAllData);
router.get("/stats", getSystemStats);

export default router;
