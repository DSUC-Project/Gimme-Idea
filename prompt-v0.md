Create a clean, mobile-first Web3 feedback platform MVP called "Gimme Idea" using Next.js 14, TypeScript, Tailwind CSS, and shadcn/ui. The platform uses wallet-only authentication and has a simple access code gate.

## CORE REQUIREMENTS:
- Access Code: "GMI2025" required to enter
- Wallet-only auth (no email): Phantom, Solflare, LazorKit passkey
- All data tied to wallet address
- Posts and comments are off-chain (database)
- Payments are on-chain (Solana USDC)
- Mobile-first responsive design
- Clean, minimal UI with good spacing

## Tech Stack:
- Next.js 14 App Router
- TypeScript  
- Tailwind CSS + shadcn/ui
- @solana/wallet-adapter-react
- @solana/spl-token (for USDC)
- Zustand for state
- React Hook Form

## COLOR SCHEME (Simple & Clean):
```css
--background: #FFFFFF (light) / #0A0A0A (dark)
--foreground: #171717
--card: #F9FAFB / #171717
--primary: #2563EB (blue)
--secondary: #64748B (gray)
--success: #10B981
--border: #E5E7EB / #262626
--radius: 0.5rem
```

## PAGES STRUCTURE:

### 1. **Access Gate (/)** 
Simple centered card:
```jsx
<div className="min-h-screen flex items-center justify-center p-4">
  <Card className="w-full max-w-md">
    <Logo />
    <h1>Welcome to Gimme Idea</h1>
    <p>Enter access code to continue</p>
    <Input placeholder="Enter code" />
    <Button>Enter</Button>
  </Card>
</div>
```

### 2. **Wallet Connect (/connect)**
After correct code, before dashboard:
```jsx
<div className="min-h-screen flex flex-col items-center justify-center p-4">
  <Logo />
  <h2>Connect Your Wallet</h2>
  <p>All your data will be linked to this wallet</p>
  
  <div className="grid gap-3 w-full max-w-sm mt-6">
    <Button onClick={connectPhantom}>
      <PhantomIcon /> Connect Phantom
    </Button>
    <Button onClick={connectSolflare}>
      <SolflareIcon /> Connect Solflare  
    </Button>
    <Button onClick={connectLazorKit}>
      <KeyIcon /> Use Passkey (LazorKit)
    </Button>
  </div>
</div>
```

### 3. **Dashboard (/dashboard)**
Clean mobile-first layout:
```jsx
// Sticky Header
<Header className="sticky top-0 z-50 bg-background/95 backdrop-blur">
  <Logo />
  <Button size="sm">New Post</Button>
  <WalletButton /> // Shows truncated address
</Header>

// Main Content - Single column on mobile, 2 on desktop
<main className="container max-w-4xl mx-auto p-4">
  // Filter Pills
  <div className="flex gap-2 overflow-x-auto pb-4">
    <Badge>All</Badge>
    <Badge>DeFi</Badge>
    <Badge>NFT</Badge>
    <Badge>Tools</Badge>
  </div>
  
  // Posts List
  <div className="space-y-4">
    {posts.map(post => (
      <PostCard key={post.id}>
        <img src={post.image} className="aspect-video object-cover rounded" />
        <h3>{post.title}</h3>
        <p className="text-sm text-muted">{post.shortDescription}</p>
        <div className="flex justify-between items-center">
          <Badge>{post.category}</Badge>
          <div className="flex gap-2 text-sm">
            {post.prizePool && <span>💰 {post.prizePool} USDC</span>}
            <span>💬 {post.commentCount}</span>
          </div>
        </div>
      </PostCard>
    ))}
  </div>
</main>
```

### 4. **Create Post (/create)**
Simple form, mobile-optimized:
```jsx
<form className="max-w-2xl mx-auto p-4 space-y-4">
  // Image Upload
  <div>
    <label>Project Image *</label>
    <div className="border-2 border-dashed rounded-lg p-8 text-center">
      <Upload className="mx-auto mb-2" />
      <p>Click or drag to upload</p>
      <input type="file" hidden />
    </div>
  </div>

  // Basic Info
  <div>
    <label>Project Name *</label>
    <Input placeholder="My awesome project" />
  </div>

  <div>
    <label>Short Description *</label>
    <Textarea placeholder="What's your project about?" rows={3} />
  </div>

  <div>
    <label>Project Link *</label>
    <Input type="url" placeholder="https://..." />
  </div>

  <div>
    <label>Category *</label>
    <Select>
      <option>DeFi</option>
      <option>NFT</option>
      <option>Gaming</option>
      <option>Tools</option>
      <option>Other</option>
    </Select>
  </div>

  // Prize Pool (Optional)
  <Card className="p-4 bg-muted/50">
    <h4>Setup Prize Pool (Optional)</h4>
    <p className="text-sm text-muted mb-4">
      Reward the best feedback with USDC prizes
    </p>
    
    <div className="space-y-3">
      <div>
        <label>Total Prize Pool (USDC)</label>
        <Input type="number" placeholder="100" />
      </div>
      
      <div>
        <label>Number of Winners</label>
        <Select onChange={updatePrizeInputs}>
          <option value="1">1 Winner</option>
          <option value="3">Top 3</option>
          <option value="5">Top 5</option>
        </Select>
      </div>
      
      // Dynamic prize distribution
      <div id="prizeDistribution" className="space-y-2">
        <div className="flex gap-2 items-center">
          <span className="w-12">1st:</span>
          <Input type="number" placeholder="50" />
          <span>USDC</span>
        </div>
        // More inputs added based on selection
      </div>
      
      <div>
        <label>Contest Ends</label>
        <Input type="datetime-local" max="30 days from now" />
      </div>
    </div>
    
    <Alert className="mt-4">
      <Info className="h-4 w-4" />
      <p className="text-sm">
        Clicking "Post with Prizes" will lock {totalPrize} USDC in escrow
      </p>
    </Alert>
  </Card>

  <div className="flex gap-3">
    <Button variant="outline">Save Draft</Button>
    <Button>Post without Prizes</Button>
    <Button variant="primary">Post with Prizes ({totalPrize} USDC)</Button>
  </div>
</form>
```

### 5. **Post Detail (/post/[id])**
Clean discussion layout:
```jsx
// Post Header
<div className="border-b pb-4">
  <img src={post.image} className="w-full aspect-video object-cover rounded-lg" />
  <h1 className="text-2xl font-bold mt-4">{post.title}</h1>
  <p className="text-muted">{post.description}</p>
  
  <div className="flex flex-wrap gap-2 mt-4">
    <Badge>{post.category}</Badge>
    <a href={post.link} className="text-primary">Visit Project →</a>
  </div>
  
  {post.prizePool && (
    <Card className="mt-4 p-3 bg-primary/5">
      <div className="flex justify-between items-center">
        <span>🏆 Prize Pool: {post.prizePool} USDC</span>
        <span>Ends: {post.endsAt}</span>
      </div>
      <div className="text-sm mt-2">
        Winners: {post.prizeDistribution.map(p => `${p.rank}: ${p.amount} USDC`).join(' | ')}
      </div>
    </Card>
  )}
</div>

// Comments Section
<div className="py-4">
  <h3 className="font-semibold mb-4">Feedback ({comments.length})</h3>
  
  // Comment Input
  <Card className="p-4 mb-4">
    <Textarea placeholder="Share your feedback..." />
    <Button className="mt-2">Post Feedback</Button>
  </Card>
  
  // Comments List
  <div className="space-y-4">
    {comments.map(comment => (
      <Card key={comment.id} className="p-4">
        <div className="flex justify-between items-start">
          <div className="flex gap-3">
            <Avatar>{comment.wallet.slice(0, 2)}</Avatar>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="font-medium">
                  {comment.wallet.slice(0, 4)}...{comment.wallet.slice(-4)}
                </span>
                <span className="text-xs text-muted">
                  {formatTime(comment.createdAt)}
                </span>
              </div>
              <p className="mt-2">{comment.content}</p>
              
              // Nested replies
              {comment.replies?.map(reply => (
                <div className="ml-8 mt-3 p-3 bg-muted/50 rounded">
                  // Reply content
                </div>
              ))}
            </div>
          </div>
          
          // Actions (only visible to post owner on their posts)
          {isPostOwner && (
            <div className="flex gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button size="sm" variant="outline">
                    🏆 Rank
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => rankFeedback(comment.id, 1)}>
                    🥇 1st Place
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => rankFeedback(comment.id, 2)}>
                    🥈 2nd Place
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => rankFeedback(comment.id, 3)}>
                    🥉 3rd Place
                  </DropdownMenuItem>
                  // More based on prize config
                </DropdownMenuContent>
              </DropdownMenu>
              
              <Button size="sm" variant="outline" onClick={() => openTipModal(comment)}>
                💸 Tip
              </Button>
            </div>
          )}
        </div>
        
        <Button size="sm" variant="ghost" className="mt-2">
          ↩️ Reply
        </Button>
      </Card>
    ))}
  </div>
</div>

// Tip Modal
<Dialog open={tipModalOpen}>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Send Tip</DialogTitle>
    </DialogHeader>
    <div className="space-y-4">
      <p>Tip to: {selectedComment.wallet}</p>
      <Input type="number" placeholder="Amount in USDC" />
      <Button onClick={sendTip}>Send Tip</Button>
    </div>
  </DialogContent>
</Dialog>
```

## KEY COMPONENTS:
```typescript
// WalletProvider.tsx
- Phantom, Solflare, LazorKit integration
- Auto-reconnect on refresh
- Wallet state in Zustand

// PostCard.tsx
- Responsive image
- Truncated description
- Prize pool badge if exists
- Comment count

// CommentThread.tsx  
- Nested replies support
- Rank/Tip buttons for post owner
- Time formatting

// PrizePoolSetup.tsx
- Dynamic winner count
- Prize distribution inputs
- Escrow explanation

// TipModal.tsx
- USDC amount input
- Gas fee estimation
- Transaction confirmation
```

## STATE MANAGEMENT:
```typescript
interface Store {
  // Access
  hasAccess: boolean
  
  // Wallet
  wallet: {
    address: string | null
    type: 'phantom' | 'solflare' | 'lazorkit' | null
    connected: boolean
  }
  
  // Posts
  posts: Post[]
  currentPost: Post | null
  
  // UI
  loading: boolean
  tipModalOpen: boolean
}
```

## API CALLS:
```typescript
// All tied to wallet address, no email
POST /api/posts - Create post (wallet required)
GET /api/posts - List posts
GET /api/posts/[id] - Get post detail
POST /api/posts/[id]/comments - Add comment
POST /api/posts/[id]/rank - Rank feedback (owner only)
POST /api/tips/send - Send tip transaction
POST /api/posts/[id]/escrow - Lock prize pool
POST /api/posts/[id]/distribute - Distribute prizes
```

Create a clean, mobile-first interface with excellent UX. Keep it simple and functional for MVP.