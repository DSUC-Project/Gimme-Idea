import { Router } from "express";
import { verifyToken } from "../middleware/auth.js";
import { validateBody } from "../middleware/validation.js";
import {
  getModerationQueue,
  approveFeedback,
  rejectFeedback,
  autoApproveAll,
} from "../controllers/moderation.controller.js";

const router = Router();

// All routes require authentication
router.use(verifyToken);

router.get("/", getModerationQueue);
router.post(
  "/:id/approve",
  validateBody({
    type: "object",
    properties: {
      rewardAmount: { type: "number", minimum: 0 },
      qualityScore: { type: "number", minimum: 0, maximum: 100 },
    },
    required: ["rewardAmount"],
  }),
  approveFeedback
);
router.post(
  "/:id/reject",
  validateBody({
    type: "object",
    properties: {
      reason: { type: "string" },
    },
  }),
  rejectFeedback
);
router.post("/auto-approve", autoApproveAll);

export default router;
