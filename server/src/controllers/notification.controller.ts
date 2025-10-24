import type { Request, Response } from "express";
import { sendSuccess, sendError } from "../utils/response.js";
import prisma from "../prisma/client.js";
import logger from "../utils/logger.js";

/**
 * Get user's notifications
 * GET /api/notifications
 */
export async function getNotifications(req: Request, res: Response) {
  try {
    if (!req.user) {
      return sendError(res, "Unauthorized", "UNAUTHORIZED", null, 401);
    }

    const { page = "1", limit = "20", unreadOnly = "false" } = req.query;
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;
    const unreadFilter = unreadOnly === "true";

    const where: any = {
      userId: req.user.id,
    };

    if (unreadFilter) {
      where.read = false;
    }

    const [notifications, total] = await Promise.all([
      prisma.notification.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: limitNum,
      }),
      prisma.notification.count({ where }),
    ]);

    const unreadCount = await prisma.notification.count({
      where: { userId: req.user.id, read: false },
    });

    return sendSuccess(res, {
      notifications,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum),
      },
      unreadCount,
    });
  } catch (error: any) {
    logger.error("Get notifications error:", error);
    return sendError(
      res,
      "Failed to get notifications",
      "GET_FAILED",
      error.message,
      500
    );
  }
}

/**
 * Mark notification as read
 * PUT /api/notifications/:id/read
 */
export async function markAsRead(req: Request, res: Response) {
  try {
    if (!req.user) {
      return sendError(res, "Unauthorized", "UNAUTHORIZED", null, 401);
    }

    const { id } = req.params;

    const notification = await prisma.notification.findFirst({
      where: { id, userId: req.user.id },
    });

    if (!notification) {
      return sendError(res, "Notification not found", "NOT_FOUND", null, 404);
    }

    await prisma.notification.update({
      where: { id },
      data: { read: true },
    });

    logger.info(`Notification marked as read: ${id} by user ${req.user.id}`);

    return sendSuccess(res, {}, "Notification marked as read");
  } catch (error: any) {
    logger.error("Mark notification as read error:", error);
    return sendError(
      res,
      "Failed to mark notification as read",
      "UPDATE_FAILED",
      error.message,
      500
    );
  }
}

/**
 * Mark all notifications as read
 * PUT /api/notifications/read-all
 */
export async function markAllAsRead(req: Request, res: Response) {
  try {
    if (!req.user) {
      return sendError(res, "Unauthorized", "UNAUTHORIZED", null, 401);
    }

    await prisma.notification.updateMany({
      where: { userId: req.user.id, read: false },
      data: { read: true },
    });

    logger.info(`All notifications marked as read by user ${req.user.id}`);

    return sendSuccess(res, {}, "All notifications marked as read");
  } catch (error: any) {
    logger.error("Mark all notifications as read error:", error);
    return sendError(
      res,
      "Failed to mark all notifications as read",
      "UPDATE_FAILED",
      error.message,
      500
    );
  }
}

/**
 * Delete notification
 * DELETE /api/notifications/:id
 */
export async function deleteNotification(req: Request, res: Response) {
  try {
    if (!req.user) {
      return sendError(res, "Unauthorized", "UNAUTHORIZED", null, 401);
    }

    const { id } = req.params;

    const notification = await prisma.notification.findFirst({
      where: { id, userId: req.user.id },
    });

    if (!notification) {
      return sendError(res, "Notification not found", "NOT_FOUND", null, 404);
    }

    await prisma.notification.delete({
      where: { id },
    });

    logger.info(`Notification deleted: ${id} by user ${req.user.id}`);

    return sendSuccess(res, {}, "Notification deleted");
  } catch (error: any) {
    logger.error("Delete notification error:", error);
    return sendError(
      res,
      "Failed to delete notification",
      "DELETE_FAILED",
      error.message,
      500
    );
  }
}

/**
 * Create notification (internal use)
 */
export async function createNotification(
  userId: string,
  type: string,
  payload: any
) {
  try {
    const notification = await prisma.notification.create({
      data: {
        userId,
        type,
        payload,
      },
    });

    logger.info(`Notification created: ${notification.id} for user ${userId}`);
    return notification;
  } catch (error: any) {
    logger.error("Create notification error:", error);
    throw error;
  }
}
