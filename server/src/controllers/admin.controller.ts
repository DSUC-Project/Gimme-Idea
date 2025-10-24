import type { Request, Response } from "express";
import { sendSuccess, sendError } from "../utils/response.js";
import prisma from "../prisma/client.js";
import logger from "../utils/logger.js";

/**
 * Clear all test data
 * DELETE /api/admin/clear-data
 */
export async function clearAllData(req: Request, res: Response) {
  try {
    if (!req.user) {
      return sendError(res, "Unauthorized", "UNAUTHORIZED", null, 401);
    }

    // Only allow in development or for admin users
    if (process.env.NODE_ENV === "production") {
      return sendError(
        res,
        "Not allowed in production",
        "FORBIDDEN",
        null,
        403
      );
    }

    // Clear all data in correct order (respecting foreign key constraints)
    await prisma.$transaction(async (tx) => {
      // Delete all data
      await tx.bookmark.deleteMany();
      await tx.feedback.deleteMany();
      await tx.transaction.deleteMany();
      await tx.notification.deleteMany();
      await tx.follow.deleteMany();
      await tx.project.deleteMany();
      await tx.user.deleteMany();
    });

    logger.info("All test data cleared");

    return sendSuccess(res, {}, "All data cleared successfully!");
  } catch (error: any) {
    logger.error("Clear data error:", error);
    return sendError(
      res,
      "Failed to clear data",
      "CLEAR_FAILED",
      error.message,
      500
    );
  }
}

/**
 * Get system stats
 * GET /api/admin/stats
 */
export async function getSystemStats(req: Request, res: Response) {
  try {
    if (!req.user) {
      return sendError(res, "Unauthorized", "UNAUTHORIZED", null, 401);
    }

    const [userCount, projectCount, feedbackCount, transactionCount] =
      await Promise.all([
        prisma.user.count(),
        prisma.project.count(),
        prisma.feedback.count(),
        prisma.transaction.count(),
      ]);

    return sendSuccess(res, {
      users: userCount,
      projects: projectCount,
      feedback: feedbackCount,
      transactions: transactionCount,
    });
  } catch (error: any) {
    logger.error("Get system stats error:", error);
    return sendError(
      res,
      "Failed to get system stats",
      "GET_FAILED",
      error.message,
      500
    );
  }
}
