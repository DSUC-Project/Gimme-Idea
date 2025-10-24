import type { Request, Response } from "express";
import { sendSuccess, sendError } from "../utils/response.js";
import prisma from "../prisma/client.js";
import logger from "../utils/logger.js";

/**
 * Get user's earnings data
 * GET /api/earnings
 */
export async function getEarnings(req: Request, res: Response) {
  try {
    if (!req.user) {
      return sendError(res, "Unauthorized", "UNAUTHORIZED", null, 401);
    }

    const { period = "all" } = req.query; // all, month, year
    const userId = req.user.id;

    // Get user's current balance and total earned
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        balance: true,
        totalEarned: true,
      },
    });

    if (!user) {
      return sendError(res, "User not found", "NOT_FOUND", null, 404);
    }

    // Calculate date filter based on period
    let dateFilter: any = {};
    if (period === "month") {
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);
      dateFilter.gte = startOfMonth;
    } else if (period === "year") {
      const startOfYear = new Date();
      startOfYear.setMonth(0, 1);
      startOfYear.setHours(0, 0, 0, 0);
      dateFilter.gte = startOfYear;
    }

    // Get reward transactions (earnings)
    const rewardTransactions = await prisma.transaction.findMany({
      where: {
        toUserId: userId,
        type: "REWARD",
        status: "COMPLETED",
        ...(Object.keys(dateFilter).length > 0
          ? { createdAt: dateFilter }
          : {}),
      },
      include: {
        project: {
          select: {
            id: true,
            title: true,
          },
        },
        fromUser: {
          select: {
            id: true,
            username: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // Get feedback count for the period
    const feedbackCount = await prisma.feedback.count({
      where: {
        reviewerId: userId,
        status: "APPROVED",
        ...(Object.keys(dateFilter).length > 0
          ? { createdAt: dateFilter }
          : {}),
      },
    });

    // Calculate total earnings for the period
    const totalEarnings = rewardTransactions.reduce(
      (sum, tx) => sum + Number(tx.amount),
      0
    );

    // Get monthly breakdown for the last 12 months
    const monthlyBreakdown = await prisma.$queryRaw`
      SELECT 
        DATE_TRUNC('month', "createdAt") as month,
        COUNT(*) as feedback_count,
        SUM(amount) as earnings
      FROM "Transaction" 
      WHERE "toUserId" = ${userId} 
        AND type = 'REWARD' 
        AND status = 'COMPLETED'
        AND "createdAt" >= NOW() - INTERVAL '12 months'
      GROUP BY DATE_TRUNC('month', "createdAt")
      ORDER BY month DESC
    `;

    // Get top earning projects
    const topProjects = await prisma.$queryRaw`
      SELECT 
        p.id,
        p.title,
        COUNT(f.id) as feedback_count,
        SUM(t.amount) as total_earnings
      FROM "Project" p
      JOIN "Feedback" f ON p.id = f."projectId"
      JOIN "Transaction" t ON f.id = (t.metadata->>'feedbackId')::uuid
      WHERE f."reviewerId" = ${userId}
        AND f.status = 'APPROVED'
        AND t.type = 'REWARD'
        AND t.status = 'COMPLETED'
      GROUP BY p.id, p.title
      ORDER BY total_earnings DESC
      LIMIT 5
    `;

    return sendSuccess(res, {
      summary: {
        totalEarnings: Number(user.totalEarned),
        currentBalance: Number(user.balance),
        periodEarnings: totalEarnings,
        feedbackCount,
        averagePerFeedback:
          feedbackCount > 0 ? totalEarnings / feedbackCount : 0,
      },
      monthlyBreakdown,
      topProjects,
      recentTransactions: rewardTransactions.slice(0, 10),
    });
  } catch (error: any) {
    logger.error("Get earnings error:", error);
    return sendError(
      res,
      "Failed to get earnings data",
      "GET_FAILED",
      error.message,
      500
    );
  }
}

/**
 * Get earnings history with pagination
 * GET /api/earnings/history
 */
export async function getEarningsHistory(req: Request, res: Response) {
  try {
    if (!req.user) {
      return sendError(res, "Unauthorized", "UNAUTHORIZED", null, 401);
    }

    const { page = "1", limit = "20" } = req.query;
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    const [transactions, total] = await Promise.all([
      prisma.transaction.findMany({
        where: {
          toUserId: req.user.id,
          type: "REWARD",
          status: "COMPLETED",
        },
        include: {
          project: {
            select: {
              id: true,
              title: true,
            },
          },
          fromUser: {
            select: {
              id: true,
              username: true,
              avatarUrl: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limitNum,
      }),
      prisma.transaction.count({
        where: {
          toUserId: req.user.id,
          type: "REWARD",
          status: "COMPLETED",
        },
      }),
    ]);

    return sendSuccess(res, {
      transactions,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (error: any) {
    logger.error("Get earnings history error:", error);
    return sendError(
      res,
      "Failed to get earnings history",
      "GET_FAILED",
      error.message,
      500
    );
  }
}
