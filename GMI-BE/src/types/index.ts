import { Request } from 'express'

export interface AuthRequest extends Request {
  walletAddress?: string
  wallet?: {
    id: string
    address: string
    type: string
  }
}

export interface PrizeDistribution {
  rank: number
  amount: number
}

export interface CreatePostInput {
  title: string
  description: string
  imageUrl: string
  projectLink: string
  category: string
  prizePool?: {
    totalAmount: number
    winnersCount: number
    distribution: PrizeDistribution[]
    endsAt: string
  }
}

export interface CreateCommentInput {
  content: string
  parentId?: string
}

export interface RankCommentInput {
  commentId: string
  rank: number
}

export interface SendTipInput {
  commentId: string
  amount: number
  txSignature: string
}

export interface WalletConnectInput {
  address: string
  type: 'phantom' | 'solflare' | 'lazorkit'
  signature: string
  message: string
}
