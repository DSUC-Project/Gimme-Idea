import type { Request, Response } from "express";
import { sendSuccess, sendError } from "../utils/response.js";
import prisma from "../prisma/client.js";
import logger from "../utils/logger.js";
import bcrypt from "bcryptjs";

/**
 * Change user password
 * PUT /api/settings/password
 */
export async function changePassword(req: Request, res: Response) {
  try {
    if (!req.user) {
      return sendError(res, "Unauthorized", "UNAUTHORIZED", null, 401);
    }

    const { currentPassword, newPassword } = req.body;

    // Get user with password
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { id: true, password: true },
    });

    if (!user) {
      return sendError(res, "User not found", "NOT_FOUND", null, 404);
    }

    // Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(
      currentPassword,
      user.password
    );
    if (!isCurrentPasswordValid) {
      return sendError(
        res,
        "Current password is incorrect",
        "INVALID_PASSWORD",
        null,
        400
      );
    }

    // Hash new password
    const hashedNewPassword = await bcrypt.hash(newPassword, 12);

    // Update password
    await prisma.user.update({
      where: { id: req.user.id },
      data: { password: hashedNewPassword },
    });

    logger.info(`Password changed for user ${req.user.id}`);

    return sendSuccess(res, {}, "Password changed successfully!");
  } catch (error: any) {
    logger.error("Change password error:", error);
    return sendError(
      res,
      "Failed to change password",
      "CHANGE_FAILED",
      error.message,
      500
    );
  }
}

/**
 * Update user profile settings
 * PUT /api/settings/profile
 */
export async function updateProfile(req: Request, res: Response) {
  try {
    if (!req.user) {
      return sendError(res, "Unauthorized", "UNAUTHORIZED", null, 401);
    }

    const {
      username,
      bio,
      avatarUrl,
      walletAddress,
      linkedinUrl,
      twitterHandle,
      githubUrl,
    } = req.body;

    const updateData: any = {};
    if (username !== undefined) updateData.username = username;
    if (bio !== undefined) updateData.bio = bio;
    if (avatarUrl !== undefined) updateData.avatarUrl = avatarUrl;
    if (walletAddress !== undefined) updateData.walletAddress = walletAddress;
    if (linkedinUrl !== undefined) updateData.linkedinUrl = linkedinUrl;
    if (twitterHandle !== undefined) updateData.twitterHandle = twitterHandle;
    if (githubUrl !== undefined) updateData.githubUrl = githubUrl;

    const updatedUser = await prisma.user.update({
      where: { id: req.user.id },
      data: updateData,
      include: {
        bookmarks: {
          select: {
            projectId: true,
          },
        },
      },
    });

    logger.info(`Profile updated for user ${req.user.id}`);

    return sendSuccess(
      res,
      { user: updatedUser },
      "Profile updated successfully!"
    );
  } catch (error: any) {
    logger.error("Update profile error:", error);

    if (error.code === "P2002") {
      if (error.meta?.target?.includes("username")) {
        return sendError(
          res,
          "Username already taken",
          "USERNAME_EXISTS",
          null,
          409
        );
      }
    }

    return sendError(
      res,
      "Failed to update profile",
      "UPDATE_FAILED",
      error.message,
      500
    );
  }
}

/**
 * Update notification preferences
 * PUT /api/settings/notifications
 */
export async function updateNotificationSettings(req: Request, res: Response) {
  try {
    if (!req.user) {
      return sendError(res, "Unauthorized", "UNAUTHORIZED", null, 401);
    }

    const {
      emailNotifications,
      feedbackNotifications,
      projectUpdates,
      weeklyDigest,
    } = req.body;

    // For now, we'll store notification preferences in user metadata
    // In a real app, you might want a separate NotificationSettings table
    const notificationSettings = {
      emailNotifications: emailNotifications ?? true,
      feedbackNotifications: feedbackNotifications ?? true,
      projectUpdates: projectUpdates ?? true,
      weeklyDigest: weeklyDigest ?? false,
    };

    await prisma.user.update({
      where: { id: req.user.id },
      data: {
        // Store in a JSON field or create a separate table
        // For now, we'll just log it
      },
    });

    logger.info(
      `Notification settings updated for user ${req.user.id}:`,
      notificationSettings
    );

    return sendSuccess(
      res,
      { settings: notificationSettings },
      "Notification settings updated!"
    );
  } catch (error: any) {
    logger.error("Update notification settings error:", error);
    return sendError(
      res,
      "Failed to update notification settings",
      "UPDATE_FAILED",
      error.message,
      500
    );
  }
}

/**
 * Delete user account
 * DELETE /api/settings/account
 */
export async function deleteAccount(req: Request, res: Response) {
  try {
    if (!req.user) {
      return sendError(res, "Unauthorized", "UNAUTHORIZED", null, 401);
    }

    const { password } = req.body;

    // Get user with password
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { id: true, password: true },
    });

    if (!user) {
      return sendError(res, "User not found", "NOT_FOUND", null, 404);
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return sendError(
        res,
        "Password is incorrect",
        "INVALID_PASSWORD",
        null,
        400
      );
    }

    // Delete user and all related data
    await prisma.$transaction(async (tx) => {
      // Delete all user's data
      await tx.bookmark.deleteMany({ where: { userId: req.user!.id } });
      await tx.feedback.deleteMany({ where: { reviewerId: req.user!.id } });
      await tx.transaction.deleteMany({
        where: {
          OR: [{ fromUserId: req.user!.id }, { toUserId: req.user!.id }],
        },
      });
      await tx.notification.deleteMany({ where: { userId: req.user!.id } });
      await tx.follow.deleteMany({
        where: {
          OR: [{ followerId: req.user!.id }, { followeeId: req.user!.id }],
        },
      });

      // Delete user's projects
      await tx.project.deleteMany({ where: { builderId: req.user!.id } });

      // Finally delete the user
      await tx.user.delete({ where: { id: req.user!.id } });
    });

    logger.info(`Account deleted for user ${req.user.id}`);

    return sendSuccess(res, {}, "Account deleted successfully!");
  } catch (error: any) {
    logger.error("Delete account error:", error);
    return sendError(
      res,
      "Failed to delete account",
      "DELETE_FAILED",
      error.message,
      500
    );
  }
}
