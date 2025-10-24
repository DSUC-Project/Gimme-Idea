import { Router } from "express";
import { verifyToken } from "../middleware/auth.js";
import { validateBody } from "../middleware/validation.js";
import {
  changePassword,
  updateProfile,
  updateNotificationSettings,
  deleteAccount,
} from "../controllers/settings.controller.js";

const router = Router();

// All routes require authentication
router.use(verifyToken);

router.put(
  "/password",
  validateBody({
    type: "object",
    properties: {
      currentPassword: { type: "string", minLength: 1 },
      newPassword: { type: "string", minLength: 6 },
    },
    required: ["currentPassword", "newPassword"],
  }),
  changePassword
);

router.put(
  "/profile",
  validateBody({
    type: "object",
    properties: {
      username: { type: "string", minLength: 3, maxLength: 30 },
      bio: { type: "string", maxLength: 500 },
      avatarUrl: { type: "string" },
      walletAddress: { type: "string" },
      linkedinUrl: { type: "string" },
      twitterHandle: { type: "string" },
      githubUrl: { type: "string" },
    },
  }),
  updateProfile
);

router.put(
  "/notifications",
  validateBody({
    type: "object",
    properties: {
      emailNotifications: { type: "boolean" },
      feedbackNotifications: { type: "boolean" },
      projectUpdates: { type: "boolean" },
      weeklyDigest: { type: "boolean" },
    },
  }),
  updateNotificationSettings
);

router.delete(
  "/account",
  validateBody({
    type: "object",
    properties: {
      password: { type: "string", minLength: 1 },
    },
    required: ["password"],
  }),
  deleteAccount
);

export default router;
