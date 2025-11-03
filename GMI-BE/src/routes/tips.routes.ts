import { Router, Response } from 'express'
import { AuthRequest, SendTipInput } from '../types'
import { authMiddleware } from '../middleware/auth.middleware'
import prisma from '../config/database'
import { connection } from '../config/solana'

const router = Router()

/**
 * POST /api/tips/send
 * Send tip to comment (verify on-chain transaction)
 */
router.post('/send', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { commentId, amount, txSignature }: SendTipInput = req.body

    if (!commentId || !amount || !txSignature) {
      return res.status(400).json({ error: 'Missing required fields' })
    }

    if (amount <= 0) {
      return res.status(400).json({ error: 'Amount must be greater than 0' })
    }

    if (!req.wallet) {
      return res.status(401).json({ error: 'Wallet not authenticated' })
    }

    // Check if comment exists
    const comment = await prisma.comment.findUnique({
      where: { id: commentId },
      include: {
        wallet: {
          select: {
            address: true
          }
        }
      }
    })

    if (!comment) {
      return res.status(404).json({ error: 'Comment not found' })
    }

    // Cannot tip your own comment
    if (comment.wallet.address === req.walletAddress) {
      return res.status(400).json({ error: 'Cannot tip your own comment' })
    }

    // Check if transaction already recorded
    const existingTip = await prisma.tip.findUnique({
      where: { txSignature }
    })

    if (existingTip) {
      return res.status(400).json({ error: 'Transaction already recorded' })
    }

    // Verify transaction on Solana blockchain
    try {
      const tx = await connection.getTransaction(txSignature, {
        maxSupportedTransactionVersion: 0
      })

      if (!tx) {
        return res.status(400).json({
          error: 'Transaction not found on blockchain',
          message: 'Please wait a few seconds and try again'
        })
      }

      // TODO: Add more verification:
      // - Check sender matches wallet address
      // - Check receiver matches comment owner
      // - Check amount matches
      // For MVP, we trust the frontend
    } catch (txError) {
      console.error('[Tips] Transaction verification error:', txError)
      return res.status(400).json({ error: 'Failed to verify transaction' })
    }

    // Record tip in database
    const tip = await prisma.tip.create({
      data: {
        commentId,
        fromWallet: req.walletAddress!,
        toWallet: comment.wallet.address,
        amount,
        txSignature
      }
    })

    // Update wallet stats
    await Promise.all([
      prisma.wallet.update({
        where: { address: req.walletAddress },
        data: { tipsGiven: { increment: amount } }
      }),
      prisma.wallet.update({
        where: { address: comment.wallet.address },
        data: { tipsReceived: { increment: amount } }
      })
    ])

    res.status(201).json({
      tip,
      message: `Successfully tipped ${amount} USDC`
    })
  } catch (error) {
    console.error('[Tips] Send error:', error)
    res.status(500).json({ error: 'Failed to send tip' })
  }
})

/**
 * GET /api/tips/:walletAddress
 * Get tip history for a wallet
 */
router.get('/:walletAddress', async (req: AuthRequest, res: Response) => {
  try {
    const { walletAddress } = req.params
    const { type = 'all' } = req.query // 'sent' | 'received' | 'all'

    const where: any = {}

    if (type === 'sent') {
      where.fromWallet = walletAddress
    } else if (type === 'received') {
      where.toWallet = walletAddress
    } else {
      where.OR = [
        { fromWallet: walletAddress },
        { toWallet: walletAddress }
      ]
    }

    const tips = await prisma.tip.findMany({
      where,
      include: {
        comment: {
          include: {
            post: {
              select: {
                id: true,
                title: true
              }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 100 // Limit to last 100 tips
    })

    // Calculate totals
    const sent = tips
      .filter(t => t.fromWallet === walletAddress)
      .reduce((sum, t) => sum + t.amount, 0)

    const received = tips
      .filter(t => t.toWallet === walletAddress)
      .reduce((sum, t) => sum + t.amount, 0)

    res.json({
      tips,
      stats: {
        sent,
        received,
        net: received - sent,
        count: tips.length
      }
    })
  } catch (error) {
    console.error('[Tips] Get history error:', error)
    res.status(500).json({ error: 'Failed to fetch tip history' })
  }
})

/**
 * GET /api/tips/comment/:commentId
 * Get tips for a specific comment
 */
router.get('/comment/:commentId', async (req: AuthRequest, res: Response) => {
  try {
    const { commentId } = req.params

    const tips = await prisma.tip.findMany({
      where: { commentId },
      orderBy: { createdAt: 'desc' }
    })

    const total = tips.reduce((sum, tip) => sum + tip.amount, 0)

    res.json({
      tips,
      total,
      count: tips.length
    })
  } catch (error) {
    console.error('[Tips] Get comment tips error:', error)
    res.status(500).json({ error: 'Failed to fetch comment tips' })
  }
})

export default router
