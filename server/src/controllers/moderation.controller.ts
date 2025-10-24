import type { Request, Response } from "express";
import { sendSuccess, sendError } from "../utils/response.js";
import prisma from "../prisma/client.js";
import logger from "../utils/logger.js";

/**
 * Get moderation queue
 * GET /api/moderation
 */
export async function getModerationQueue(req: Request, res: Response) {
  try {
    if (!req.user) {
      return sendError(res, "Unauthorized", "UNAUTHORIZED", null, 401);
    }

    // Only allow users with admin role or specific moderation permissions
    // For now, we'll allow all authenticated users to see moderation queue
    // In production, you'd want to check for admin role

    const { page = "1", limit = "20", type } = req.query;
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    const where: any = {
      status: "PENDING",
    };

    if (type) {
      where.type = type;
    }

    const [feedback, total] = await Promise.all([
      prisma.feedback.findMany({
        where,
        include: {
          project: {
            select: {
              id: true,
              title: true,
            },
          },
          reviewer: {
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
      prisma.feedback.count({ where }),
    ]);

    // Get moderation stats
    const stats = await Promise.all([
      prisma.feedback.count({ where: { status: "PENDING" } }),
      prisma.feedback.count({
        where: {
          status: "APPROVED",
          createdAt: {
            gte: new Date(new Date().setHours(0, 0, 0, 0)),
          },
        },
      }),
      prisma.feedback.count({
        where: {
          status: "REJECTED",
          createdAt: {
            gte: new Date(new Date().setHours(0, 0, 0, 0)),
          },
        },
      }),
    ]);

    // Calculate accuracy (approved vs total processed today)
    const totalProcessedToday = stats[1] + stats[2];
    const accuracy =
      totalProcessedToday > 0 ? (stats[1] / totalProcessedToday) * 100 : 0;

    return sendSuccess(res, {
      feedback,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum),
      },
      stats: {
        pending: stats[0],
        approvedToday: stats[1],
        rejectedToday: stats[2],
        accuracy: Math.round(accuracy),
      },
    });
  } catch (error: any) {
    logger.error("Get moderation queue error:", error);
    return sendError(
      res,
      "Failed to get moderation queue",
      "GET_FAILED",
      error.message,
      500
    );
  }
}

/**
 * Approve feedback
 * POST /api/moderation/:id/approve
 */
export async function approveFeedback(req: Request, res: Response) {
  try {
    if (!req.user) {
      return sendError(res, "Unauthorized", "UNAUTHORIZED", null, 401);
    }

    const { id } = req.params;
    const { rewardAmount, qualityScore } = req.body;

    const feedback = await prisma.feedback.findUnique({
      where: { id },
      include: {
        project: true,
        reviewer: true,
      },
    });

    if (!feedback) {
      return sendError(res, "Feedback not found", "NOT_FOUND", null, 404);
    }

    if (feedback.status !== "PENDING") {
      return sendError(
        res,
        "Feedback already processed",
        "ALREADY_PROCESSED",
        null,
        400
      );
    }

    const reward = parseFloat(rewardAmount || "0");
    const bountyAmount = parseFloat(feedback.project.bountyAmount.toString());
    const bountyDistributed = parseFloat(
      feedback.project.bountyDistributed.toString()
    );
    const remaining = bountyAmount - bountyDistributed;

    if (reward > remaining) {
      return sendError(
        res,
        "Reward exceeds remaining bounty",
        "INSUFFICIENT_BOUNTY",
        null,
        400
      );
    }

    // Update feedback and project in a transaction
    await prisma.$transaction(async (tx) => {
      // Update feedback
      await tx.feedback.update({
        where: { id },
        data: {
          status: "APPROVED",
          rewardAmount: reward,
          qualityScore: qualityScore || null,
        },
      });

      // Update project bounty distributed
      await tx.project.update({
        where: { id: feedback.projectId },
        data: {
          bountyDistributed: {
            increment: reward,
          },
        },
      });

      // Update reviewer stats
      await tx.user.update({
        where: { id: feedback.reviewerId },
        data: {
          totalEarned: {
            increment: reward,
          },
          balance: {
            increment: reward,
          },
          reputationScore: {
            increment: qualityScore || 0,
          },
        },
      });

      // Create transaction record
      await tx.transaction.create({
        data: {
          type: "REWARD",
          fromUserId: feedback.project.builderId,
          toUserId: feedback.reviewerId,
          projectId: feedback.projectId,
          amount: reward,
          status: "COMPLETED",
          metadata: {
            feedbackId: id,
            qualityScore: qualityScore || 0,
          },
        },
      });
    });

    logger.info(`Feedback approved via moderation: ${id}, reward: ${reward}`);

    return sendSuccess(res, {}, "Feedback approved successfully!");
  } catch (error: any) {
    logger.error("Approve feedback error:", error);
    return sendError(
      res,
      "Failed to approve feedback",
      "APPROVE_FAILED",
      error.message,
      500
    );
  }
}

/**
 * Reject feedback
 * POST /api/moderation/:id/reject
 */
export async function rejectFeedback(req: Request, res: Response) {
  try {
    if (!req.user) {
      return sendError(res, "Unauthorized", "UNAUTHORIZED", null, 401);
    }

    const { id } = req.params;
    const { reason } = req.body;

    const feedback = await prisma.feedback.findUnique({
      where: { id },
    });

    if (!feedback) {
      return sendError(res, "Feedback not found", "NOT_FOUND", null, 404);
    }

    if (feedback.status !== "PENDING") {
      return sendError(
        res,
        "Feedback already processed",
        "ALREADY_PROCESSED",
        null,
        400
      );
    }

    await prisma.feedback.update({
      where: { id },
      data: {
        status: "REJECTED",
      },
    });

    logger.info(
      `Feedback rejected via moderation: ${id}, reason: ${reason || "none"}`
    );

    return sendSuccess(res, {}, "Feedback rejected successfully!");
  } catch (error: any) {
    logger.error("Reject feedback error:", error);
    return sendError(
      res,
      "Failed to reject feedback",
      "REJECT_FAILED",
      error.message,
      500
    );
  }
}

/**
 * Auto-approve all pending feedback
 * POST /api/moderation/auto-approve
 */
export async function autoApproveAll(req: Request, res: Response) {
  try {
    if (!req.user) {
      return sendError(res, "Unauthorized", "UNAUTHORIZED", null, 401);
    }

    const pendingFeedback = await prisma.feedback.findMany({
      where: { status: "PENDING" },
      include: {
        project: true,
      },
    });

    let approvedCount = 0;
    let rejectedCount = 0;

    for (const feedback of pendingFeedback) {
      try {
        // Simple auto-approval logic - you can make this more sophisticated
        const shouldApprove = Math.random() > 0.1; // 90% approval rate

        if (shouldApprove) {
          const reward = Math.min(
            10,
            parseFloat(feedback.project.bountyAmount.toString()) * 0.1
          );

          await prisma.$transaction(async (tx) => {
            await tx.feedback.update({
              where: { id: feedback.id },
              data: {
                status: "APPROVED",
                rewardAmount: reward,
                qualityScore: 75, // Default quality score
              },
            });

            await tx.project.update({
              where: { id: feedback.projectId },
              data: {
                bountyDistributed: { increment: reward },
              },
            });

            await tx.user.update({
              where: { id: feedback.reviewerId },
              data: {
                totalEarned: { increment: reward },
                balance: { increment: reward },
                reputationScore: { increment: 75 },
              },
            });

            await tx.transaction.create({
              data: {
                type: "REWARD",
                fromUserId: feedback.project.builderId,
                toUserId: feedback.reviewerId,
                projectId: feedback.projectId,
                amount: reward,
                status: "COMPLETED",
                metadata: {
                  feedbackId: feedback.id,
                  qualityScore: 75,
                },
              },
            });
          });

          approvedCount++;
        } else {
          await prisma.feedback.update({
            where: { id: feedback.id },
            data: { status: "REJECTED" },
          });
          rejectedCount++;
        }
      } catch (error) {
        logger.error(
          `Auto-approval failed for feedback ${feedback.id}:`,
          error
        );
        rejectedCount++;
      }
    }

    logger.info(
      `Auto-approval completed: ${approvedCount} approved, ${rejectedCount} rejected`
    );

    return sendSuccess(
      res,
      {
        approved: approvedCount,
        rejected: rejectedCount,
      },
      "Auto-approval completed!"
    );
  } catch (error: any) {
    logger.error("Auto-approve all error:", error);
    return sendError(
      res,
      "Failed to auto-approve feedback",
      "AUTO_APPROVE_FAILED",
      error.message,
      500
    );
  }
}
