# 🔄 Step-by-Step: Replace Server Actions với API Calls

## 📌 Overview

Chúng ta sẽ thay thế **Server Actions** (call trực tiếp Supabase) bằng **API calls** tới GMI-BE.

**Workflow mới:**
```
Frontend → Sign message → GMI-BE API → Verify signature → Database
```

---

## ✅ BƯỚC 1: Update Connect Wallet Page

### File: `app/connect/page.tsx`

**Thay đổi:**
- ❌ Xóa: `getOrCreateProfile()` Server Action
- ✅ Thêm: `API.Wallet.connectWallet()` + signature signing

**Code mới:**

```typescript
"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useWallet } from "@solana/wallet-adapter-react"
import { Button } from "@/components/ui/button"
import { Logo } from "@/components/logo"
import { useAppStore } from "@/lib/stores/app-store"
import { signAuthMessage, storeSignature } from "@/lib/auth/sign-message"
import { API } from "@/lib/api"
import { AlertCircle, CheckCircle } from "lucide-react"
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui"

export default function ConnectWallet() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const wallet = useWallet()
  const setWallet = useAppStore((state) => state.setWallet)
  const setUserProfile = useAppStore((state) => state.setUserProfile)

  useEffect(() => {
    // Don't auto-connect, wait for user to click Continue
  }, [wallet.connected, wallet.publicKey])

  const handleConnectComplete = async () => {
    if (!wallet.publicKey || !wallet.signMessage) {
      setError("Wallet not connected properly")
      return
    }

    setLoading(true)
    setError(null)

    try {
      const walletAddress = wallet.publicKey.toString()

      // 1. Sign authentication message
      const { signature, message, address } = await signAuthMessage(wallet)

      // 2. Call GMI-BE API to connect wallet
      const response = await API.Wallet.connectWallet({
        address,
        type: wallet.wallet?.adapter.name || 'phantom',
        signature,
        message
      })

      if (!response.success || !response.data) {
        throw new Error(response.error || 'Failed to connect wallet')
      }

      // 3. Store signature for future API calls
      storeSignature(address, signature, message)

      // 4. Update app state
      setUserProfile(response.data.wallet)
      setWallet({
        address: walletAddress,
        type: wallet.wallet?.adapter.name.toLowerCase() as any,
        connected: true,
      })

      console.log('[Wallet] Connected:', walletAddress)
      router.push("/dashboard")
    } catch (err) {
      let errorMessage = "Failed to connect wallet"

      if (err instanceof Error) {
        const errorStr = err.message.toLowerCase()

        if (errorStr.includes("rejected") || errorStr.includes("user denied")) {
          errorMessage = "Signature was cancelled. Please try again."
        } else if (errorStr.includes("not found")) {
          errorMessage = "Wallet not found. Install Phantom or Solflare."
        } else {
          errorMessage = err.message
        }
      }

      console.error('[Wallet] Connection error:', err)
      setError(errorMessage)
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-background">
      <div className="w-full max-w-sm space-y-8">
        <div className="flex justify-center">
          <Logo />
        </div>

        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold">Connect Your Wallet</h2>
          <p className="text-muted-foreground">All your data will be linked to this wallet</p>
          <p className="text-xs text-muted-foreground">Using Solana Devnet for testing</p>
        </div>

        {error && (
          <div className="flex gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {wallet.connected && (
          <div className="flex gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-green-600">Wallet connected! Click continue to sign in.</p>
          </div>
        )}

        <div className="w-full flex flex-col items-center gap-3">
          <WalletMultiButton className="h-12" />
          <Button
            onClick={handleConnectComplete}
            disabled={!wallet.connected || loading}
            className="w-full max-w-xs"
          >
            {loading ? "Authenticating..." : wallet.connected ? "Continue & Sign" : "Connect Wallet Above"}
          </Button>
        </div>

        <p className="text-xs text-muted-foreground text-center">
          Don't have a Solana wallet? Download Phantom or Solflare from their official websites.
          Make sure to switch to Devnet for testing.
        </p>

        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 space-y-2">
          <p className="text-sm font-semibold text-purple-900">Devnet Setup Required:</p>
          <ul className="text-xs text-purple-700 space-y-1">
            <li>
              • Fund your wallet:{" "}
              <a href="https://solfaucet.com" target="_blank" rel="noopener noreferrer" className="underline">
                solfaucet.com
              </a>
            </li>
            <li>• Switch to Devnet in your wallet settings</li>
            <li>• All transactions are testnet only</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
```

**Những thay đổi chính:**
1. Import `API` và `signAuthMessage`
2. Thay `getOrCreateProfile()` → `signAuthMessage()` + `API.Wallet.connectWallet()`
3. Store signature để dùng cho các API calls sau
4. Handle errors từ API response

---

## ✅ BƯỚC 2: Update Dashboard Page

### File: `app/dashboard/page.tsx`

**Thay đổi:**
- ❌ Xóa: `getAllPosts()` Server Action
- ✅ Thêm: `API.Posts.getPosts()`

**Code mới:**

```typescript
"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { PostCard } from "@/components/post-card"
import { Navbar } from "@/components/navbar"
import { useAppStore } from "@/lib/stores/app-store"
import { API } from "@/lib/api"
import { Plus, Loader2 } from "lucide-react"

const CATEGORIES = [
  "All",
  "DeFi",
  "NFT",
  "Gaming",
  "Web3 Infrastructure",
  "Wallet",
  "DAO",
  "Layer 2",
  "Staking",
  "Bridge",
  "Metaverse",
  "Social",
  "Education",
  "Tools",
  "Other",
]

export default function Dashboard() {
  const router = useRouter()
  const { wallet } = useAppStore()
  const [selectedCategory, setSelectedCategory] = useState("All")
  const [posts, setPosts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    if (!wallet.connected) {
      router.push("/")
    }
  }, [wallet.connected, router])

  useEffect(() => {
    const fetchPosts = async () => {
      setLoading(true)
      setError("")

      try {
        // Call GMI-BE API instead of Server Action
        const response = await API.Posts.getPosts({
          category: selectedCategory === "All" ? undefined : selectedCategory,
          page: 1,
          limit: 50
        })

        if (!response.success || !response.data) {
          throw new Error(response.error || 'Failed to fetch posts')
        }

        setPosts(response.data.posts)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch posts")
        console.error("[Dashboard] Error fetching posts:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchPosts()
  }, [selectedCategory])

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="max-w-6xl mx-auto px-4 py-6 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <Link href="/create">
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              New Project
            </Button>
          </Link>
        </div>

        {/* Filter Pills */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          {CATEGORIES.map((category) => (
            <Badge
              key={category}
              variant={selectedCategory === category ? "default" : "outline"}
              onClick={() => setSelectedCategory(category)}
              className="cursor-pointer whitespace-nowrap"
            >
              {category}
            </Badge>
          ))}
        </div>

        {/* Posts Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {loading ? (
            <div className="col-span-full text-center py-12">
              <Loader2 className="w-8 h-8 mx-auto animate-spin text-muted-foreground mb-2" />
              <p className="text-muted-foreground">Loading posts...</p>
            </div>
          ) : error ? (
            <div className="col-span-full text-center py-12">
              <p className="text-destructive mb-4">{error}</p>
              <Button onClick={() => setSelectedCategory(selectedCategory)}>Retry</Button>
            </div>
          ) : posts.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <p className="text-muted-foreground mb-4">No projects yet in {selectedCategory}</p>
              <Link href="/create">
                <Button>Create the first project</Button>
              </Link>
            </div>
          ) : (
            posts.map((post) => (
              <PostCard
                key={post.id}
                id={post.id}
                title={post.title}
                short_description={post.description} // ⚠️ Changed from short_description
                image_url={post.imageUrl} // ⚠️ Changed from image_url
                category={post.category}
                prize_pool_amount={post.prizePool?.totalAmount} // ⚠️ Changed structure
              />
            ))
          )}
        </div>
      </main>
    </div>
  )
}
```

**⚠️ Lưu ý:** Response structure từ GMI-BE khác với Supabase. Cần update `PostCard` component để match.

---

## ✅ BƯỚC 3: Update PostCard Component

### File: `components/post-card.tsx`

Cần check và update props để match với GMI-BE response format:

```typescript
// Old (Supabase format):
// short_description, image_url, prize_pool_amount

// New (GMI-BE format):
// description, imageUrl, prizePool.totalAmount
```

Check file này và update nếu cần:

```bash
# Check current structure
cat GMI-FE/components/post-card.tsx
```

---

## ✅ BƯỚC 4: Update Create Post Page

### File: `app/create/page.tsx`

**Key changes:**
1. Sign message before creating post
2. Upload image with signature
3. Call `API.Posts.createPost()` instead of Server Action
4. Include prize pool data if applicable

**Example structure:**

```typescript
const handleSubmit = async (data) => {
  // 1. Get cached signature or sign new message
  const { signature, message } = getCachedSignature(wallet.address) ||
                                  await signAuthMessage(wallet)

  // 2. Upload image (if exists)
  let imageUrl = null
  if (imageFile) {
    const uploadResponse = await API.Upload.uploadImage(
      imageFile,
      wallet.address,
      signature
    )
    imageUrl = uploadResponse.data?.url
  }

  // 3. Create post
  const response = await API.Posts.createPost(
    {
      title: data.title,
      description: data.description,
      category: data.category,
      imageUrl,
      prizePool: hasPrize ? {
        totalAmount: data.prizeAmount,
        winnersCount: data.winnersCount,
        distribution: data.distribution,
        endsAt: data.endDate.toISOString()
      } : undefined
    },
    wallet.address,
    signature
  )

  if (response.success) {
    router.push(`/post/${response.data.id}`)
  }
}
```

---

## ✅ BƯỚC 5: Update Post Detail Page

### File: `app/post/[id]/page.tsx`

**Changes:**
1. Fetch post with `API.Posts.getPost()`
2. Fetch comments with `API.Comments.getComments()`
3. Add comment với signature authentication

---

## 🚀 Quick Start Guide

### 1. Tạo .env.local
```bash
cd GMI-FE
cp .env.example .env.local
```

Edit `.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_ACCESS_CODE=GMI2025
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-key
```

### 2. Start Backend
```bash
cd ../GMI-BE
npm run dev  # Port 3001
```

### 3. Start Frontend
```bash
cd ../GMI-FE
npm run dev  # Port 3000
```

### 4. Test Flow
1. Go to http://localhost:3000
2. Enter access code: GMI2025
3. Connect wallet
4. Sign authentication message
5. Browse dashboard (should fetch posts from GMI-BE API)

---

## 📊 Testing Checklist

- [ ] Access code works
- [ ] Wallet connection + signature
- [ ] Dashboard loads posts from API
- [ ] Create post works
- [ ] Image upload works
- [ ] Post detail page loads
- [ ] Comments work
- [ ] Prize pools display correctly

---

## 🐛 Common Issues

### 1. CORS Error
**Problem:** `Access to fetch blocked by CORS policy`

**Solution:** Check GMI-BE `server.ts`:
```typescript
app.use(cors({
  origin: 'http://localhost:3000', // Must match FE URL
  credentials: true
}))
```

### 2. Signature Expired
**Problem:** `Invalid signature` after 1 hour

**Solution:** Call `signAuthMessage()` again to get new signature

### 3. API Not Found
**Problem:** `404 Not Found`

**Solution:** Make sure GMI-BE is running on port 3001

---

## 📝 Next Steps After This

1. ✅ Complete all page replacements
2. Add Realtime subscriptions (comments, tips)
3. Integrate Smart Contract calls
4. Add loading states & error boundaries
5. Test on Devnet
6. Deploy!

---

**Need Help?** Check [PROGRESS-SUMMARY.md](PROGRESS-SUMMARY.md) for full project overview.
