Create a backend API for "Gimme Idea" MVP - a wallet-based feedback platform on Solana. Uses wallet-only authentication (no email), with off-chain posts/comments and on-chain USDC payments.

## CORE FEATURES:
- Access code gate: "GMI2025"
- Wallet-only auth (Phantom, Solflare, LazorKit)
- All data tied to wallet address
- Off-chain: posts, comments (PostgreSQL)
- On-chain: tips, prize pools (Solana USDC)
- Prize pool escrow system with timed distribution

## Tech Stack:
- Next.js 14 API Routes
- TypeScript
- Prisma + PostgreSQL (Supabase)
- @solana/web3.js
- @solana/spl-token (USDC)
- @project-serum/anchor (for escrow)

## DATABASE SCHEMA:
```prisma
model Wallet {
  id            String   @id @default(cuid())
  address       String   @unique
  type          String   // phantom, solflare, lazorkit
  
  // Stats
  postsCount    Int      @default(0)
  tipsReceived  Float    @default(0)
  tipsGiven     Float    @default(0)
  
  createdAt     DateTime @default(now())
  lastActiveAt  DateTime @updatedAt
  
  posts         Post[]
  comments      Comment[]
  prizePools    PrizePool[]
  rankings      Ranking[]
  
  @@index([address])
}

model Post {
  id              String    @id @default(cuid())
  walletId        String
  
  // Content
  imageUrl        String
  title           String
  description     String
  projectLink     String
  category        String
  
  // Prize Pool (optional)
  hasPrizePool    Boolean   @default(false)
  
  // Stats
  viewCount       Int       @default(0)
  commentCount    Int       @default(0)
  
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
  
  wallet          Wallet    @relation(fields: [walletId], references: [id])
  comments        Comment[]
  prizePool       PrizePool?
  
  @@index([walletId])
  @@index([category])
}

model PrizePool {
  id              String    @id @default(cuid())
  postId          String    @unique
  walletId        String
  
  // Pool Config
  totalAmount     Float     // Total USDC
  winnersCount    Int       // Number of winners (1-5)
  distribution    Json      // [{rank: 1, amount: 50}, {rank: 2, amount: 30}...]
  
  // Escrow
  escrowAccount   String?   // Solana escrow account address
  escrowTx        String?   // Lock transaction signature
  
  // Timing
  endsAt          DateTime
  ended           Boolean   @default(false)
  distributed     Boolean   @default(false)
  distributeTx    String?   // Distribution transaction signature
  
  createdAt       DateTime  @default(now())
  
  post            Post      @relation(fields: [postId], references: [id])
  wallet          Wallet    @relation(fields: [walletId], references: [id])
  rankings        Ranking[]
  
  @@index([endsAt])
}

model Comment {
  id            String    @id @default(cuid())
  postId        String
  walletId      String
  
  content       String    @db.Text
  parentId      String?   // For nested replies
  
  // Ranking (if selected as winner)
  ranking       Ranking?
  
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  
  post          Post      @relation(fields: [postId], references: [id], onDelete: Cascade)
  wallet        Wallet    @relation(fields: [walletId], references: [id])
  parent        Comment?  @relation("CommentReplies", fields: [parentId], references: [id])
  replies       Comment[] @relation("CommentReplies")
  tips          Tip[]
  
  @@index([postId])
  @@index([walletId])
}

model Ranking {
  id            String    @id @default(cuid())
  prizePoolId   String
  commentId     String    @unique
  walletId      String    // Post owner who ranked
  
  rank          Int       // 1-5
  prizeAmount   Float     // USDC amount for this rank
  claimed       Boolean   @default(false)
  
  createdAt     DateTime  @default(now())
  
  prizePool     PrizePool @relation(fields: [prizePoolId], references: [id])
  comment       Comment   @relation(fields: [commentId], references: [id])
  wallet        Wallet    @relation(fields: [walletId], references: [id])
  
  @@unique([prizePoolId, rank])
  @@index([prizePoolId])
}

model Tip {
  id            String    @id @default(cuid())
  commentId     String
  
  fromWallet    String
  toWallet      String
  amount        Float     // USDC amount
  
  txSignature   String    @unique
  
  createdAt     DateTime  @default(now())
  
  comment       Comment   @relation(fields: [commentId], references: [id])
  
  @@index([fromWallet])
  @@index([toWallet])
}
```

## API IMPLEMENTATION:

### Access Control:
```typescript
// middleware.ts
import { NextRequest, NextResponse } from 'next/server'

const ACCESS_CODE = 'GMI2025'
const PUBLIC_PATHS = ['/api/access']

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname
  
  if (!PUBLIC_PATHS.includes(path)) {
    const hasAccess = request.cookies.get('access_granted')
    const wallet = request.headers.get('x-wallet-address')
    
    if (!hasAccess) {
      return NextResponse.json({ error: 'Access code required' }, { status: 401 })
    }
    
    if (!wallet && !path.includes('/api/access')) {
      return NextResponse.json({ error: 'Wallet connection required' }, { status: 401 })
    }
  }
  
  return NextResponse.next()
}
```

### Access & Wallet Routes:
```typescript
// app/api/access/route.ts
export async function POST(request: Request) {
  const { code } = await request.json()
  
  if (code !== 'GMI2025') {
    return NextResponse.json({ error: 'Invalid access code' }, { status: 401 })
  }
  
  const response = NextResponse.json({ success: true })
  response.cookies.set('access_granted', 'true', {
    httpOnly: true,
    secure: true,
    maxAge: 30 * 24 * 60 * 60 // 30 days
  })
  
  return response
}

// app/api/wallet/connect/route.ts
export async function POST(request: Request) {
  const { address, type, signature, message } = await request.json()
  
  // Verify wallet signature
  const verified = await verifyWalletSignature(address, signature, message)
  if (!verified) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
  }
  
  // Create or update wallet
  const wallet = await prisma.wallet.upsert({
    where: { address },
    update: { lastActiveAt: new Date(), type },
    create: { address, type }
  })
  
  return NextResponse.json({ wallet })
}
```

### Post Routes:
```typescript
// app/api/posts/route.ts
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const category = searchParams.get('category')
  
  const posts = await prisma.post.findMany({
    where: category ? { category } : {},
    include: {
      wallet: true,
      prizePool: true,
      _count: {
        select: { comments: true }
      }
    },
    orderBy: { createdAt: 'desc' }
  })
  
  return NextResponse.json({ posts })
}

export async function POST(request: Request) {
  const walletAddress = request.headers.get('x-wallet-address')!
  const data = await request.json()
  
  const wallet = await prisma.wallet.findUnique({
    where: { address: walletAddress }
  })
  
  // Create post
  const post = await prisma.post.create({
    data: {
      walletId: wallet!.id,
      imageUrl: data.imageUrl,
      title: data.title,
      description: data.description,
      projectLink: data.projectLink,
      category: data.category,
      hasPrizePool: !!data.prizePool
    }
  })
  
  // If has prize pool, create escrow
  if (data.prizePool) {
    const { totalAmount, distribution, endsAt } = data.prizePool
    
    // Create escrow account on Solana
    const escrow = await createEscrowAccount(
      walletAddress,
      totalAmount,
      distribution,
      endsAt
    )
    
    await prisma.prizePool.create({
      data: {
        postId: post.id,
        walletId: wallet!.id,
        totalAmount,
        winnersCount: distribution.length,
        distribution,
        endsAt: new Date(endsAt),
        escrowAccount: escrow.account,
        escrowTx: escrow.signature
      }
    })
  }
  
  return NextResponse.json({ post })
}
```

### Comment Routes:
```typescript
// app/api/posts/[id]/comments/route.ts
export async function POST(request: Request, { params }: { params: { id: string } }) {
  const walletAddress = request.headers.get('x-wallet-address')!
  const { content, parentId } = await request.json()
  
  const wallet = await prisma.wallet.findUnique({
    where: { address: walletAddress }
  })
  
  const comment = await prisma.comment.create({
    data: {
      postId: params.id,
      walletId: wallet!.id,
      content,
      parentId
    }
  })
  
  // Update comment count
  await prisma.post.update({
    where: { id: params.id },
    data: { commentCount: { increment: 1 } }
  })
  
  return NextResponse.json({ comment })
}
```

### Ranking System:
```typescript
// app/api/posts/[id]/rank/route.ts
export async function POST(request: Request, { params }: { params: { id: string } }) {
  const walletAddress = request.headers.get('x-wallet-address')!
  const { commentId, rank } = await request.json()
  
  // Verify post owner
  const post = await prisma.post.findUnique({
    where: { id: params.id },
    include: { wallet: true, prizePool: true }
  })
  
  if (post!.wallet.address !== walletAddress) {
    return NextResponse.json({ error: 'Only post owner can rank' }, { status: 403 })
  }
  
  if (!post!.prizePool) {
    return NextResponse.json({ error: 'No prize pool' }, { status: 400 })
  }
  
  // Check if rank already assigned
  const existingRank = await prisma.ranking.findUnique({
    where: {
      prizePoolId_rank: {
        prizePoolId: post!.prizePool.id,
        rank
      }
    }
  })
  
  if (existingRank) {
    return NextResponse.json({ error: 'Rank already assigned' }, { status: 400 })
  }
  
  // Get prize amount for this rank
  const distribution = post!.prizePool.distribution as any[]
  const prizeAmount = distribution.find(d => d.rank === rank)?.amount || 0
  
  // Create ranking
  const ranking = await prisma.ranking.create({
    data: {
      prizePoolId: post!.prizePool.id,
      commentId,
      walletId: post!.wallet.id,
      rank,
      prizeAmount
    }
  })
  
  return NextResponse.json({ ranking })
}
```

### Prize Distribution (Cron job or manual trigger):
```typescript
// app/api/posts/[id]/distribute/route.ts
export async function POST(request: Request, { params }: { params: { id: string } }) {
  const prizePool = await prisma.prizePool.findFirst({
    where: {
      postId: params.id,
      ended: false,
      endsAt: { lte: new Date() }
    },
    include: {
      rankings: {
        include: {
          comment: {
            include: { wallet: true }
          }
        }
      }
    }
  })
  
  if (!prizePool) {
    return NextResponse.json({ error: 'No active prize pool' }, { status: 400 })
  }
  
  // Distribute prizes via Solana
  const distributions = await Promise.all(
    prizePool.rankings.map(async (ranking) => {
      const tx = await transferUSDC(
        prizePool.escrowAccount!,
        ranking.comment.wallet.address,
        ranking.prizeAmount
      )
      
      await prisma.ranking.update({
        where: { id: ranking.id },
        data: { claimed: true }
      })
      
      return tx
    })
  )
  
  // Mark as distributed
  await prisma.prizePool.update({
    where: { id: prizePool.id },
    data: {
      ended: true,
      distributed: true,
      distributeTx: distributions[0] // Store first tx as reference
    }
  })
  
  return NextResponse.json({ success: true, transactions: distributions })
}
```

### Tip System:
```typescript
// app/api/tips/send/route.ts
export async function POST(request: Request) {
  const { commentId, toWallet, amount, signature } = await request.json()
  const fromWallet = request.headers.get('x-wallet-address')!
  
  // Verify transaction on Solana
  const verified = await verifyUSDCTransfer(signature, fromWallet, toWallet, amount)
  if (!verified) {
    return NextResponse.json({ error: 'Invalid transaction' }, { status: 400 })
  }
  
  // Record tip
  const tip = await prisma.tip.create({
    data: {
      commentId,
      fromWallet,
      toWallet,
      amount,
      txSignature: signature
    }
  })
  
  // Update wallet stats
  await Promise.all([
    prisma.wallet.update({
      where: { address: fromWallet },
      data: { tipsGiven: { increment: amount } }
    }),
    prisma.wallet.update({
      where: { address: toWallet },
      data: { tipsReceived: { increment: amount } }
    })
  ])
  
  return NextResponse.json({ tip })
}
```

## SOLANA INTEGRATION:
```typescript
// lib/solana.ts
import { Connection, PublicKey, Transaction } from '@solana/web3.js'
import { TOKEN_PROGRAM_ID, getAssociatedTokenAddress } from '@solana/spl-token'

const connection = new Connection(process.env.SOLANA_RPC_URL!)
const USDC_MINT = new PublicKey('EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v') // USDC on mainnet

export async function verifyWalletSignature(
  address: string,
  signature: string,
  message: string
): Promise<boolean> {
  // Verify signature logic
  return true
}

export async function createEscrowAccount(
  owner: string,
  amount: number,
  distribution: any[],
  endsAt: Date
) {
  // Create PDA for escrow
  // Transfer USDC to escrow
  // Return account and signature
  return {
    account: 'escrow_address',
    signature: 'tx_signature'
  }
}

export async function transferUSDC(
  from: string,
  to: string,
  amount: number
): Promise<string> {
  // Build and send USDC transfer transaction
  return 'tx_signature'
}

export async function verifyUSDCTransfer(
  signature: string,
  from: string,
  to: string,
  amount: number
): Promise<boolean> {
  const tx = await connection.getTransaction(signature)
  // Verify transaction details
  return true
}
```

## SMART CONTRACT ADVICE FOR ESCROW:

For the prize pool escrow system, I recommend using Anchor framework:
```rust
// Simple escrow program structure
pub struct PrizePool {
    pub owner: Pubkey,
    pub total_amount: u64,
    pub ends_at: i64,
    pub winners: Vec<Winner>,
    pub distributed: bool,
}

pub struct Winner {
    pub wallet: Pubkey,
    pub amount: u64,
    pub claimed: bool,
}

// Instructions:
// 1. create_pool - Create escrow and lock USDC
// 2. set_winners - Owner sets winners before deadline
// 3. claim_prize - Winners claim after deadline
// 4. emergency_withdraw - Owner can withdraw if no winners set
```

## ENVIRONMENT VARIABLES:
```env
DATABASE_URL="postgresql://..."
SOLANA_RPC_URL="https://api.mainnet-beta.solana.com"
NEXT_PUBLIC_ACCESS_CODE="GMI2025"
```

Create a secure, functional MVP backend that handles wallet authentication, off-chain data storage, and on-chain USDC transactions for tips and prize pools.