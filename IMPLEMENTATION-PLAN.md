# 🚀 GIMME IDEA - IMPLEMENTATION PLAN
## Realtime + Smart Contract (Devnet)

---

## 🎯 ARCHITECTURE OVERVIEW

```
┌─────────────────────────────────────────────────────────┐
│                    gimmeidea.com                        │
│                                                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │           GMI-FE (Next.js 16)                   │   │
│  │  - UI Components từ v0 (giữ nguyên)            │   │
│  │  - Realtime subscriptions (Supabase)           │   │
│  │  - Wallet adapter (Phantom/Solflare/Lazorkit)  │   │
│  │  - API client → GMI-BE                         │   │
│  └────────────┬────────────────────────────────────┘   │
│               │                                         │
│               ▼                                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │         GMI-BE (Express + Prisma)               │   │
│  │  - REST API Routes                              │   │
│  │  - Wallet signature verification                │   │
│  │  - Access code middleware                       │   │
│  │  - Solana integration                           │   │
│  └────┬────────────────┬─────────────────┬─────────┘   │
│       │                │                 │             │
│       ▼                ▼                 ▼             │
│  ┌─────────┐    ┌──────────┐    ┌──────────────┐      │
│  │Supabase │    │  Solana  │    │Smart Contract│      │
│  │PostgreSQL│    │  Devnet  │    │  (Anchor)   │      │
│  │Realtime │    │   RPC    │    │   Devnet    │      │
│  └─────────┘    └──────────┘    └──────────────┘      │
└─────────────────────────────────────────────────────────┘
```

---

## 📦 TECH STACK CHI TIẾT

### **GMI-FE (Frontend)**
- Next.js 16 (App Router)
- React 19
- TypeScript
- Tailwind CSS + shadcn/ui
- @solana/wallet-adapter-react
- Supabase Client (Realtime)
- Zustand (State management)

### **GMI-BE (Backend)**
- Express.js 4.18
- TypeScript
- Prisma ORM
- PostgreSQL (Supabase)
- @solana/web3.js
- @solana/spl-token
- tweetnacl (Signature verification)

### **Smart Contract**
- Anchor Framework 0.30
- Rust
- Solana Devnet
- SPL Token (USDC on Devnet)

---

## 🏗️ FOLDER STRUCTURE

```
Gimme-Idea/
│
├── GMI-FE/                          # Frontend
│   ├── app/                         # Next.js pages (giữ từ v0)
│   ├── components/                  # UI components (giữ từ v0)
│   ├── hooks/                       # Custom hooks
│   ├── lib/
│   │   ├── api/                     # NEW: API client
│   │   │   ├── client.ts            # Axios/Fetch wrapper
│   │   │   ├── posts.ts             # Posts API calls
│   │   │   ├── comments.ts          # Comments API calls
│   │   │   └── rankings.ts          # Rankings API calls
│   │   ├── solana/                  # Solana integration (giữ)
│   │   ├── stores/                  # Zustand stores (giữ)
│   │   └── realtime/                # NEW: Realtime subscriptions
│   │       └── supabase-realtime.ts
│   ├── .env.local                   # Environment variables
│   └── package.json
│
├── GMI-BE/                          # Backend (TẠO MỚI)
│   ├── src/
│   │   ├── routes/
│   │   │   ├── access.routes.ts     # Access code verification
│   │   │   ├── wallet.routes.ts     # Wallet authentication
│   │   │   ├── posts.routes.ts      # Posts CRUD
│   │   │   ├── comments.routes.ts   # Comments CRUD
│   │   │   ├── rankings.routes.ts   # Prize rankings
│   │   │   ├── tips.routes.ts       # Tipping system
│   │   │   ├── prizes.routes.ts     # Prize distribution
│   │   │   └── upload.routes.ts     # Image upload
│   │   │
│   │   ├── middleware/
│   │   │   ├── auth.middleware.ts   # Wallet verification
│   │   │   ├── access.middleware.ts # Access code check
│   │   │   └── error.middleware.ts  # Error handling
│   │   │
│   │   ├── services/
│   │   │   ├── wallet.service.ts    # Signature verification
│   │   │   ├── post.service.ts      # Post business logic
│   │   │   ├── escrow.service.ts    # Smart contract interaction
│   │   │   ├── solana.service.ts    # Solana RPC calls
│   │   │   └── storage.service.ts   # Supabase Storage
│   │   │
│   │   ├── prisma/
│   │   │   ├── schema.prisma        # Database schema
│   │   │   └── migrations/          # DB migrations
│   │   │
│   │   ├── config/
│   │   │   ├── database.ts          # Prisma config
│   │   │   ├── solana.ts            # Solana config
│   │   │   └── supabase.ts          # Supabase config
│   │   │
│   │   ├── types/                   # TypeScript types
│   │   ├── utils/                   # Utility functions
│   │   └── server.ts                # Express server
│   │
│   ├── .env                         # Environment variables
│   ├── package.json
│   └── tsconfig.json
│
└── gimme-idea-contract/             # Smart Contract (TẠO MỚI)
    ├── programs/
    │   └── gimme-idea/
    │       ├── src/
    │       │   ├── lib.rs           # Main contract code
    │       │   ├── state.rs         # Program state
    │       │   ├── instructions/    # Instructions
    │       │   │   ├── create_pool.rs
    │       │   │   ├── set_winners.rs
    │       │   │   ├── claim_prize.rs
    │       │   │   └── mod.rs
    │       │   └── errors.rs        # Custom errors
    │       └── Cargo.toml
    │
    ├── tests/
    │   └── gimme-idea.ts            # Contract tests
    ├── Anchor.toml                  # Anchor config
    └── package.json
```

---

## 🗄️ DATABASE SCHEMA (Prisma)

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

model Wallet {
  id            String   @id @default(cuid())
  address       String   @unique
  type          String   // phantom, solflare, lazorkit

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

  imageUrl        String
  title           String
  description     String
  projectLink     String
  category        String

  hasPrizePool    Boolean   @default(false)
  viewCount       Int       @default(0)
  commentCount    Int       @default(0)

  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt

  wallet          Wallet    @relation(fields: [walletId], references: [id])
  comments        Comment[]
  prizePool       PrizePool?

  @@index([walletId])
  @@index([category])
  @@index([createdAt])
}

model PrizePool {
  id              String    @id @default(cuid())
  postId          String    @unique
  walletId        String

  totalAmount     Float
  winnersCount    Int
  distribution    Json      // [{rank: 1, amount: 50}, ...]

  // Smart Contract Data
  escrowPda       String?   // Program Derived Address
  escrowTx        String?   // Lock transaction signature
  escrowBump      Int?      // PDA bump seed

  endsAt          DateTime
  ended           Boolean   @default(false)
  distributed     Boolean   @default(false)
  distributeTx    String?

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
  parentId      String?

  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  post          Post      @relation(fields: [postId], references: [id], onDelete: Cascade)
  wallet        Wallet    @relation(fields: [walletId], references: [id])
  parent        Comment?  @relation("CommentReplies", fields: [parentId], references: [id])
  replies       Comment[] @relation("CommentReplies")
  ranking       Ranking?
  tips          Tip[]

  @@index([postId])
  @@index([walletId])
  @@index([createdAt])
}

model Ranking {
  id            String    @id @default(cuid())
  prizePoolId   String
  commentId     String    @unique
  walletId      String

  rank          Int
  prizeAmount   Float
  claimed       Boolean   @default(false)
  claimTx       String?   // Claim transaction signature

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
  amount        Float

  txSignature   String    @unique

  createdAt     DateTime  @default(now())

  comment       Comment   @relation(fields: [commentId], references: [id])

  @@index([fromWallet])
  @@index([toWallet])
  @@index([createdAt])
}
```

---

## 🔐 SMART CONTRACT STRUCTURE (Anchor)

```rust
// programs/gimme-idea/src/lib.rs
use anchor_lang::prelude::*;
use anchor_spl::token::{self, Token, TokenAccount, Transfer};

declare_id!("GimmEideaXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"); // Will be generated

#[program]
pub mod gimme_idea {
    use super::*;

    // 1. Create prize pool and lock USDC
    pub fn create_pool(
        ctx: Context<CreatePool>,
        total_amount: u64,
        winners_count: u8,
        ends_at: i64,
    ) -> Result<()> {
        // Transfer USDC to escrow PDA
        // Initialize PrizePool account
    }

    // 2. Set winners (only pool owner)
    pub fn set_winners(
        ctx: Context<SetWinners>,
        winners: Vec<Winner>,
    ) -> Result<()> {
        // Verify owner
        // Set winners array
    }

    // 3. Claim prize (by winner)
    pub fn claim_prize(
        ctx: Context<ClaimPrize>,
    ) -> Result<()> {
        // Verify deadline passed
        // Verify caller is winner
        // Transfer prize amount
        // Mark as claimed
    }

    // 4. Emergency withdraw (if no winners set)
    pub fn emergency_withdraw(
        ctx: Context<EmergencyWithdraw>,
    ) -> Result<()> {
        // Verify deadline + 7 days passed
        // Verify no winners set
        // Return funds to owner
    }
}

#[account]
pub struct PrizePool {
    pub owner: Pubkey,
    pub total_amount: u64,
    pub winners_count: u8,
    pub winners: Vec<Winner>,
    pub ends_at: i64,
    pub distributed: bool,
    pub bump: u8,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone)]
pub struct Winner {
    pub wallet: Pubkey,
    pub rank: u8,
    pub amount: u64,
    pub claimed: bool,
}
```

---

## 📡 REALTIME IMPLEMENTATION

### **Frontend (Supabase Realtime)**

```typescript
// lib/realtime/supabase-realtime.ts
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// Subscribe to new comments
export function subscribeToComments(
  postId: string,
  callback: (comment: any) => void
) {
  return supabase
    .channel(`comments:post_id=eq.${postId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'comments',
        filter: `post_id=eq.${postId}`,
      },
      (payload) => callback(payload.new)
    )
    .subscribe()
}

// Subscribe to rankings updates
export function subscribeToRankings(
  postId: string,
  callback: (ranking: any) => void
) {
  return supabase
    .channel(`rankings:post_id=eq.${postId}`)
    .on(
      'postgres_changes',
      {
        event: '*', // INSERT, UPDATE, DELETE
        schema: 'public',
        table: 'feedback_rankings',
        filter: `post_id=eq.${postId}`,
      },
      (payload) => callback(payload.new || payload.old)
    )
    .subscribe()
}

// Subscribe to tips
export function subscribeToTips(
  walletAddress: string,
  callback: (tip: any) => void
) {
  return supabase
    .channel(`tips:to_wallet=eq.${walletAddress}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'tips',
        filter: `to_wallet=eq.${walletAddress}`,
      },
      (payload) => callback(payload.new)
    )
    .subscribe()
}
```

### **Usage in Components**

```typescript
// app/post/[id]/page.tsx
'use client'

import { useEffect } from 'react'
import { subscribeToComments } from '@/lib/realtime/supabase-realtime'

export default function PostDetailPage({ params }: { params: { id: string } }) {
  const [comments, setComments] = useState([])

  useEffect(() => {
    // Subscribe to realtime comments
    const channel = subscribeToComments(params.id, (newComment) => {
      setComments(prev => [newComment, ...prev])
      // Show toast notification
      toast.success('New comment received!')
    })

    // Cleanup
    return () => {
      channel.unsubscribe()
    }
  }, [params.id])

  return (
    // Render comments...
  )
}
```

---

## 🔄 API ENDPOINTS

### **Backend REST API**

```
BASE_URL: https://api.gimmeidea.com (Railway)

Authentication:
  Header: x-wallet-address: <wallet_address>
  Header: x-wallet-signature: <signature>

Access Control:
  Header: x-access-code: GMI2025

──────────────────────────────────────────────────────

POST   /api/access
  Body: { code: "GMI2025" }
  Response: { success: true, token: "..." }

POST   /api/wallet/connect
  Body: { address, type, signature, message }
  Response: { wallet: {...} }

GET    /api/posts
  Query: ?category=DeFi&limit=20&offset=0
  Response: { posts: [...], total: 100 }

POST   /api/posts
  Body: {
    title, description, imageUrl, projectLink, category,
    prizePool?: { totalAmount, distribution, endsAt }
  }
  Response: { post: {...}, escrowPda?: "..." }

GET    /api/posts/:id
  Response: { post: {...}, comments: [...], rankings: [...] }

POST   /api/posts/:id/comments
  Body: { content, parentId? }
  Response: { comment: {...} }

POST   /api/posts/:id/rank
  Body: { commentId, rank }
  Response: { ranking: {...} }

POST   /api/prizes/:id/claim
  Body: { signature }
  Response: { tx: "...", amount: 50 }

POST   /api/tips/send
  Body: { commentId, amount, signature }
  Response: { tip: {...} }

POST   /api/upload
  Body: FormData with image file
  Response: { url: "https://..." }
```

---

## ⏱️ IMPLEMENTATION TIMELINE

| Phase | Task | Time | Status |
|-------|------|------|--------|
| **1** | **GMI-BE Setup** |
| 1.1 | Create project structure | 15m | Pending |
| 1.2 | Setup Prisma + database | 20m | Pending |
| 1.3 | Implement authentication middleware | 30m | Pending |
| **2** | **API Routes** |
| 2.1 | Access & Wallet routes | 30m | Pending |
| 2.2 | Posts CRUD routes | 45m | Pending |
| 2.3 | Comments routes | 30m | Pending |
| 2.4 | Rankings routes | 30m | Pending |
| 2.5 | Tips routes | 30m | Pending |
| 2.6 | Upload routes | 20m | Pending |
| **3** | **Smart Contract** |
| 3.1 | Setup Anchor project | 20m | Pending |
| 3.2 | Write contract code | 2h | Pending |
| 3.3 | Write tests | 1h | Pending |
| 3.4 | Deploy to Devnet | 30m | Pending |
| 3.5 | Integrate with backend | 45m | Pending |
| **4** | **Realtime** |
| 4.1 | Setup Supabase Realtime | 20m | Pending |
| 4.2 | Implement subscriptions | 30m | Pending |
| 4.3 | Add UI notifications | 20m | Pending |
| **5** | **Frontend Updates** |
| 5.1 | Remove "v0" references | 30m | Pending |
| 5.2 | Create API client | 45m | Pending |
| 5.3 | Update components to use API | 1.5h | Pending |
| 5.4 | Add realtime features | 45m | Pending |
| **6** | **Testing** |
| 6.1 | Test API endpoints | 30m | Pending |
| 6.2 | Test smart contract | 30m | Pending |
| 6.3 | Test realtime | 20m | Pending |
| 6.4 | E2E testing | 1h | Pending |
| **7** | **Deployment** |
| 7.1 | Deploy contract to Devnet | 20m | Pending |
| 7.2 | Deploy BE to Railway | 30m | Pending |
| 7.3 | Deploy FE to Vercel | 20m | Pending |
| 7.4 | Final testing on production | 30m | Pending |
| | | | |
| | **TOTAL** | **~14-16 hours** | |

**Breakdown:**
- Backend: 4-5 hours
- Smart Contract: 4-5 hours
- Frontend updates: 3-4 hours
- Testing & Deployment: 2-3 hours

---

## 💰 CHI PHÍ (DEVNET)

| Item | Cost |
|------|------|
| Supabase Free Tier | $0 |
| Railway Free Tier | $0 ($5 credit/month) |
| Vercel Free Tier | $0 |
| Solana Devnet SOL | $0 (airdrop miễn phí) |
| Devnet USDC | $0 (mint miễn phí) |
| Domain (if needed) | ~$10-15/year |
| **TOTAL** | **$0** (hoặc ~$10 nếu mua domain) |

---

## 🚀 NEXT STEPS

**Tôi sẽ bắt đầu implement theo thứ tự:**

1. ✅ **Tạo GMI-BE** (Express + Prisma) - 1 giờ
2. ✅ **Viết Smart Contract** (Anchor) - 3 giờ
3. ✅ **Remove v0 references** - 30 phút
4. ✅ **Implement Realtime** - 1 giờ
5. ✅ **Connect FE với BE** - 2 giờ
6. ✅ **Testing** - 2 giờ
7. ✅ **Deploy** - 1 giờ

**Timeline: 2-3 ngày làm việc**

---

## ❓ CONFIRM

Bạn có OK với plan này không? Nếu OK, tôi sẽ:

1. Bắt đầu tạo GMI-BE ngay
2. Implement từng bước theo todo list
3. Báo cáo tiến độ sau mỗi major milestone

**Hãy reply "START" để tôi bắt đầu ngay!** 🚀
