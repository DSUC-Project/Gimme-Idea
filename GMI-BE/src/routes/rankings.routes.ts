import { Router, Response } from 'express'
import { AuthRequest, RankCommentInput } from '../types'
import { authMiddleware } from '../middleware/auth.middleware'
import prisma from '../config/database'

const router = Router()

/**
 * POST /api/posts/:postId/rank
 * Rank a comment (post owner only)
 */
router.post('/:postId', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { postId } = req.params
    const { commentId, rank }: RankCommentInput = req.body

    if (!commentId || !rank) {
      return res.status(400).json({ error: 'Comment ID and rank required' })
    }

    if (rank < 1 || rank > 5) {
      return res.status(400).json({ error: 'Rank must be between 1 and 5' })
    }

    if (!req.wallet) {
      return res.status(401).json({ error: 'Wallet not authenticated' })
    }

    // Get post with prize pool
    const post = await prisma.post.findUnique({
      where: { id: postId },
      include: {
        wallet: true,
        prizePool: {
          include: {
            rankings: true
          }
        }
      }
    })

    if (!post) {
      return res.status(404).json({ error: 'Post not found' })
    }

    // Check if user is post owner
    if (post.wallet.address !== req.walletAddress) {
      return res.status(403).json({ error: 'Only post owner can rank comments' })
    }

    // Check if post has prize pool
    if (!post.prizePool) {
      return res.status(400).json({ error: 'Post does not have a prize pool' })
    }

    // Check if prize pool has ended
    if (new Date() < post.prizePool.endsAt) {
      return res.status(400).json({
        error: 'Cannot rank comments before prize pool ends',
        endsAt: post.prizePool.endsAt
      })
    }

    // Check if prize pool is already distributed
    if (post.prizePool.distributed) {
      return res.status(400).json({ error: 'Prize pool already distributed' })
    }

    // Check if comment exists and belongs to this post
    const comment = await prisma.comment.findUnique({
      where: { id: commentId },
      include: { wallet: true }
    })

    if (!comment) {
      return res.status(404).json({ error: 'Comment not found' })
    }

    if (comment.postId !== postId) {
      return res.status(400).json({ error: 'Comment does not belong to this post' })
    }

    // Check if rank is already taken
    const existingRank = post.prizePool.rankings.find(r => r.rank === rank)
    if (existingRank) {
      return res.status(400).json({
        error: `Rank ${rank} is already assigned`,
        commentId: existingRank.commentId
      })
    }

    // Check if comment is already ranked
    const commentRank = post.prizePool.rankings.find(r => r.commentId === commentId)
    if (commentRank) {
      return res.status(400).json({
        error: 'Comment is already ranked',
        rank: commentRank.rank
      })
    }

    // Get prize amount for this rank
    const distribution = post.prizePool.distribution as any[]
    const prizeInfo = distribution.find(d => d.rank === rank)

    if (!prizeInfo) {
      return res.status(400).json({ error: 'Invalid rank for this prize pool' })
    }

    // Create ranking
    const ranking = await prisma.ranking.create({
      data: {
        prizePoolId: post.prizePool.id,
        commentId,
        walletId: req.wallet.id,
        rank,
        prizeAmount: prizeInfo.amount
      },
      include: {
        comment: {
          include: {
            wallet: {
              select: {
                address: true
              }
            }
          }
        }
      }
    })

    res.status(201).json({
      ranking,
      message: `Comment ranked #${rank} for ${prizeInfo.amount} USDC`
    })
  } catch (error) {
    console.error('[Rankings] Create error:', error)
    res.status(500).json({ error: 'Failed to rank comment' })
  }
})

/**
 * GET /api/posts/:postId/rankings
 * Get all rankings for a post
 */
router.get('/:postId', async (req: AuthRequest, res: Response) => {
  try {
    const { postId } = req.params

    const prizePool = await prisma.prizePool.findFirst({
      where: { postId },
      include: {
        rankings: {
          include: {
            comment: {
              include: {
                wallet: {
                  select: {
                    address: true,
                    type: true
                  }
                }
              }
            }
          },
          orderBy: { rank: 'asc' }
        }
      }
    })

    if (!prizePool) {
      return res.status(404).json({ error: 'Prize pool not found' })
    }

    res.json({
      rankings: prizePool.rankings,
      prizePool: {
        totalAmount: prizePool.totalAmount,
        winnersCount: prizePool.winnersCount,
        distribution: prizePool.distribution,
        endsAt: prizePool.endsAt,
        distributed: prizePool.distributed
      }
    })
  } catch (error) {
    console.error('[Rankings] Get error:', error)
    res.status(500).json({ error: 'Failed to fetch rankings' })
  }
})

/**
 * DELETE /api/rankings/:id
 * Remove ranking (post owner only, before distribution)
 */
router.delete('/:id', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params

    if (!req.wallet) {
      return res.status(401).json({ error: 'Wallet not authenticated' })
    }

    // Get ranking with post info
    const ranking = await prisma.ranking.findUnique({
      where: { id },
      include: {
        prizePool: {
          include: {
            post: {
              include: {
                wallet: true
              }
            }
          }
        }
      }
    })

    if (!ranking) {
      return res.status(404).json({ error: 'Ranking not found' })
    }

    // Check if user is post owner
    if (ranking.prizePool.post.wallet.address !== req.walletAddress) {
      return res.status(403).json({ error: 'Only post owner can remove rankings' })
    }

    // Check if already distributed
    if (ranking.prizePool.distributed || ranking.claimed) {
      return res.status(400).json({ error: 'Cannot remove ranking after distribution' })
    }

    // Delete ranking
    await prisma.ranking.delete({ where: { id } })

    res.json({ success: true, message: 'Ranking removed successfully' })
  } catch (error) {
    console.error('[Rankings] Delete error:', error)
    res.status(500).json({ error: 'Failed to remove ranking' })
  }
})

export default router
