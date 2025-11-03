import { Router, Response } from 'express'
import { AuthRequest } from '../types'
import { authMiddleware } from '../middleware/auth.middleware'
import prisma from '../config/database'

const router = Router()

/**
 * POST /api/prizes/:prizePoolId/distribute
 * Distribute prizes to winners (post owner only)
 */
router.post('/:prizePoolId/distribute', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { prizePoolId } = req.params

    if (!req.wallet) {
      return res.status(401).json({ error: 'Wallet not authenticated' })
    }

    // Get prize pool with rankings
    const prizePool = await prisma.prizePool.findUnique({
      where: { id: prizePoolId },
      include: {
        post: {
          include: {
            wallet: true
          }
        },
        rankings: {
          include: {
            comment: {
              include: {
                wallet: true
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

    // Check if user is post owner
    if (prizePool.post.wallet.address !== req.walletAddress) {
      return res.status(403).json({ error: 'Only post owner can distribute prizes' })
    }

    // Check if prize pool has ended
    if (new Date() < prizePool.endsAt) {
      return res.status(400).json({
        error: 'Cannot distribute prizes before end date',
        endsAt: prizePool.endsAt
      })
    }

    // Check if already distributed
    if (prizePool.distributed) {
      return res.status(400).json({ error: 'Prizes already distributed' })
    }

    // Check if all winners are set
    const distribution = prizePool.distribution as any[]
    if (prizePool.rankings.length !== distribution.length) {
      return res.status(400).json({
        error: 'Not all winners have been ranked',
        ranked: prizePool.rankings.length,
        required: distribution.length
      })
    }

    // TODO: Interact with smart contract to distribute prizes
    // For now, just mark as distributed in database
    // In production, this would:
    // 1. Call smart contract's distribute instruction
    // 2. Get transaction signature
    // 3. Update database

    // Mark prize pool as distributed
    await prisma.prizePool.update({
      where: { id: prizePoolId },
      data: {
        distributed: true,
        ended: true,
        distributeTx: 'simulated_tx_' + Date.now() // TODO: Real tx signature
      }
    })

    res.json({
      success: true,
      message: 'Prizes distributed successfully',
      rankings: prizePool.rankings.map(r => ({
        rank: r.rank,
        wallet: r.comment.wallet.address,
        amount: r.prizeAmount
      }))
    })
  } catch (error) {
    console.error('[Prizes] Distribute error:', error)
    res.status(500).json({ error: 'Failed to distribute prizes' })
  }
})

/**
 * POST /api/prizes/:rankingId/claim
 * Claim prize (winner only)
 */
router.post('/:rankingId/claim', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { rankingId } = req.params

    if (!req.wallet) {
      return res.status(401).json({ error: 'Wallet not authenticated' })
    }

    // Get ranking
    const ranking = await prisma.ranking.findUnique({
      where: { id: rankingId },
      include: {
        comment: {
          include: {
            wallet: true
          }
        },
        prizePool: true
      }
    })

    if (!ranking) {
      return res.status(404).json({ error: 'Ranking not found' })
    }

    // Check if user is the winner
    if (ranking.comment.wallet.address !== req.walletAddress) {
      return res.status(403).json({ error: 'Only winner can claim prize' })
    }

    // Check if already claimed
    if (ranking.claimed) {
      return res.status(400).json({
        error: 'Prize already claimed',
        claimTx: ranking.claimTx
      })
    }

    // Check if prize pool is distributed
    if (!ranking.prizePool.distributed) {
      return res.status(400).json({ error: 'Prizes not yet distributed' })
    }

    // TODO: Interact with smart contract to claim prize
    // For now, just mark as claimed in database
    // In production, this would:
    // 1. Call smart contract's claim instruction
    // 2. Get transaction signature
    // 3. Update database

    const claimTx = 'claim_tx_' + Date.now() // TODO: Real tx signature

    // Mark ranking as claimed
    await prisma.ranking.update({
      where: { id: rankingId },
      data: {
        claimed: true,
        claimTx
      }
    })

    res.json({
      success: true,
      message: `Claimed prize of ${ranking.prizeAmount} USDC`,
      claimTx
    })
  } catch (error) {
    console.error('[Prizes] Claim error:', error)
    res.status(500).json({ error: 'Failed to claim prize' })
  }
})

/**
 * GET /api/prizes/:prizePoolId/status
 * Get prize pool status
 */
router.get('/:prizePoolId/status', async (req: AuthRequest, res: Response) => {
  try {
    const { prizePoolId } = req.params

    const prizePool = await prisma.prizePool.findUnique({
      where: { id: prizePoolId },
      include: {
        rankings: {
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
          },
          orderBy: { rank: 'asc' }
        }
      }
    })

    if (!prizePool) {
      return res.status(404).json({ error: 'Prize pool not found' })
    }

    const now = new Date()
    const distribution = prizePool.distribution as any[]

    res.json({
      prizePool: {
        id: prizePool.id,
        totalAmount: prizePool.totalAmount,
        winnersCount: prizePool.winnersCount,
        distribution,
        endsAt: prizePool.endsAt,
        ended: prizePool.ended || now >= prizePool.endsAt,
        distributed: prizePool.distributed,
        distributeTx: prizePool.distributeTx,
        escrowPda: prizePool.escrowPda,
        escrowTx: prizePool.escrowTx
      },
      rankings: prizePool.rankings.map(r => ({
        rank: r.rank,
        amount: r.prizeAmount,
        winner: r.comment.wallet.address,
        claimed: r.claimed,
        claimTx: r.claimTx,
        commentId: r.commentId
      })),
      status: {
        rankingsComplete: prizePool.rankings.length === distribution.length,
        canDistribute: !prizePool.distributed && now >= prizePool.endsAt && prizePool.rankings.length === distribution.length,
        timeRemaining: prizePool.endsAt > now ? prizePool.endsAt.getTime() - now.getTime() : 0
      }
    })
  } catch (error) {
    console.error('[Prizes] Status error:', error)
    res.status(500).json({ error: 'Failed to get prize pool status' })
  }
})

export default router
