import type { Request, Response } from 'express';
import { Prisma, TransactionType } from '@prisma/client';
import prisma from '../prisma/client.js';
import { sendError, sendSuccess } from '../utils/response.js';
import logger from '../utils/logger.js';
import { transformTransaction, transformUser } from '../utils/transformers.js';

export async function getCurrentUser(req: Request, res: Response) {
  try {
    if (!req.user) {
      return sendError(res, 'Unauthorized', 'UNAUTHORIZED', null, 401);
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: {
        bookmarks: {
          select: {
            projectId: true,
          },
        },
      },
    });

    if (!user) {
      return sendError(res, 'User not found', 'NOT_FOUND', null, 404);
    }

    const [projectsCreated, feedbackGiven, feedbackReceived, pendingFeedback] = await Promise.all([
      prisma.project.count({ where: { builderId: user.id } }),
      prisma.feedback.count({ where: { reviewerId: user.id } }),
      prisma.feedback.count({
        where: {
          project: {
            builderId: user.id,
          },
        },
      }),
      prisma.feedback.count({
        where: {
          status: 'PENDING',
          project: {
            builderId: user.id,
          },
        },
      }),
    ]);

    const formattedUser = transformUser(user as any);

    return sendSuccess(res, {
      user: formattedUser,
      stats: {
        projectsCreated,
        feedbackGiven,
        feedbackReceived,
        pendingFeedback,
        bookmarks: formattedUser.bookmarks.length,
      },
    });
  } catch (error: any) {
    logger.error('Get current user error:', error);
    return sendError(res, 'Failed to fetch user profile', 'GET_FAILED', error.message, 500);
  }
}

export async function updateCurrentUser(req: Request, res: Response) {
  try {
    if (!req.user) {
      return sendError(res, 'Unauthorized', 'UNAUTHORIZED', null, 401);
    }

    const { username, bio, avatarUrl, walletAddress, linkedinUrl, twitterHandle, githubUrl } = req.body;

    const payload: Prisma.UserUpdateInput = {};

    if (username !== undefined) payload.username = username;
    if (bio !== undefined) payload.bio = bio;
    if (avatarUrl !== undefined) payload.avatarUrl = avatarUrl || null;
    if (walletAddress !== undefined) payload.walletAddress = walletAddress || null;
    if (linkedinUrl !== undefined) payload.linkedinUrl = linkedinUrl || null;
    if (twitterHandle !== undefined) payload.twitterHandle = twitterHandle || null;
    if (githubUrl !== undefined) payload.githubUrl = githubUrl || null;

    const updated = await prisma.user.update({
      where: { id: req.user.id },
      data: payload,
      include: {
        bookmarks: {
          select: {
            projectId: true,
          },
        },
      },
    });

    const formatted = transformUser(updated as any);

    return sendSuccess(res, { user: formatted }, 'Profile updated successfully!');
  } catch (error: any) {
    logger.error('Update user error:', error);

    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      if (Array.isArray(error.meta?.target) && error.meta?.target.includes('username')) {
        return sendError(res, 'Username already taken', 'USERNAME_EXISTS', null, 409);
      }
    }

    return sendError(res, 'Failed to update profile', 'UPDATE_FAILED', error.message, 500);
  }
}

export async function getUserTransactions(req: Request, res: Response) {
  try {
    if (!req.user) {
      return sendError(res, 'Unauthorized', 'UNAUTHORIZED', null, 401);
    }

    const { type } = req.query;
    let typeFilter: TransactionType | undefined;

    if (typeof type === 'string') {
      const normalized = type.toUpperCase();
      if ((Object.values(TransactionType) as string[]).includes(normalized)) {
        typeFilter = normalized as TransactionType;
      }
    }

    const transactions = await prisma.transaction.findMany({
      where: {
        OR: [
          { fromUserId: req.user.id },
          { toUserId: req.user.id },
        ],
        ...(typeFilter ? { type: typeFilter } : {}),
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
        toUser: {
          select: {
            id: true,
            username: true,
            avatarUrl: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    const formatted = transactions.map((transaction) => transformTransaction(transaction as any));

    const summary = formatted.reduce(
      (acc, transaction) => {
        if (transaction.toUserId === req.user!.id) {
          acc.incoming += transaction.amount;
        }
        if (transaction.fromUserId === req.user!.id) {
          acc.outgoing += transaction.amount;
        }
        return acc;
      },
      {
        incoming: 0,
        outgoing: 0,
      },
    );

    const balanceRecord = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        balance: true,
        totalEarned: true,
      },
    });

    const balance = balanceRecord ? Number(balanceRecord.balance) : 0;
    const totalEarned = balanceRecord ? Number(balanceRecord.totalEarned) : 0;

    return sendSuccess(res, {
      transactions: formatted,
      stats: {
        incoming: summary.incoming,
        outgoing: summary.outgoing,
        net: summary.incoming - summary.outgoing,
        balance,
        totalEarned,
      },
    });
  } catch (error: any) {
    logger.error('Get transactions error:', error);
    return sendError(res, 'Failed to fetch transactions', 'GET_FAILED', error.message, 500);
  }
}
