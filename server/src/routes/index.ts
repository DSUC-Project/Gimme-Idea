import { Router } from "express";
import authRouter from "./auth.routes.js";
import projectRouter from "./project.routes.js";
import feedbackRouter from "./feedback.routes.js";
import userRouter from "./user.routes.js";
import notificationRouter from "./notification.routes.js";
import earningsRouter from "./earnings.routes.js";
import moderationRouter from "./moderation.routes.js";
import settingsRouter from "./settings.routes.js";
import adminRouter from "./admin.routes.js";

const router = Router();

router.use("/auth", authRouter);
router.use("/projects", projectRouter);
router.use("/users", userRouter);
router.use("/notifications", notificationRouter);
router.use("/earnings", earningsRouter);
router.use("/moderation", moderationRouter);
router.use("/settings", settingsRouter);
router.use("/admin", adminRouter);
router.use("/", feedbackRouter); // Feedback routes include /projects/:id/feedback and /feedback/:id

export default router;
