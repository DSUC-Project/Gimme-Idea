# 🚀 QUICK START GUIDE

Hướng dẫn nhanh để chạy Gimme Idea project locally.

---

## 📋 Prerequisites

- Node.js 18+ installed
- PostgreSQL database (Supabase account)
- Solana wallet (Phantom/Solflare) on Devnet

---

## ⚡ Quick Setup (5 minutes)

### 1️⃣ Setup Backend (GMI-BE)

```bash
cd GMI-BE

# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Edit .env with your credentials
nano .env  # or use any text editor
```

**Required .env variables:**
```env
DATABASE_URL="postgresql://..."  # From Supabase
SUPABASE_URL="https://xxx.supabase.co"
SUPABASE_ANON_KEY="eyJ..."
SUPABASE_SERVICE_ROLE_KEY="eyJ..."
SOLANA_RPC_URL="https://api.devnet.solana.com"
PORT=3001
CORS_ORIGIN="http://localhost:3000"
ACCESS_CODE="GMI2025"
```

**Setup database:**
```bash
npm run prisma:generate
npm run prisma:migrate
```

**Start backend:**
```bash
npm run dev  # Runs on http://localhost:3001
```

✅ Backend ready when you see:
```
🚀 Gimme Idea Backend Server
📡 Server running on http://localhost:3001
```

---

### 2️⃣ Setup Frontend (GMI-FE)

```bash
cd GMI-FE

# Install dependencies
npm install

# Copy environment file
cp .env.example .env.local

# Edit .env.local
nano .env.local
```

**Required .env.local variables:**
```env
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_ACCESS_CODE=GMI2025
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
NEXT_PUBLIC_SOLANA_NETWORK=devnet
NEXT_PUBLIC_SOLANA_RPC_URL=https://api.devnet.solana.com
```

**Update files with new code:**

```bash
# 1. Copy new connect page
cp _templates/connect-page-new.tsx app/connect/page.tsx

# 2. Copy new dashboard page
cp _templates/dashboard-page-new.tsx app/dashboard/page.tsx

# 3. Copy new post card
cp _templates/post-card-new.tsx components/post-card.tsx
```

**Start frontend:**
```bash
npm run dev  # Runs on http://localhost:3000
```

✅ Frontend ready when you see:
```
✓ Ready in 2.3s
○ Local: http://localhost:3000
```

---

## 🧪 Test the Integration

### 1. Access the app
```
http://localhost:3000
```

### 2. Enter access code
```
GMI2025
```

### 3. Connect wallet
- Click "Connect Wallet"
- Select Phantom/Solflare
- Approve connection
- **Sign the authentication message** ✍️
- Should redirect to /dashboard

### 4. Check backend logs
You should see in GMI-BE terminal:
```
[Wallet] Connect: <your-wallet-address>
[Wallet] Signature verified ✓
```

### 5. Check frontend
- Dashboard should load
- If you see posts, integration works! 🎉
- If empty, that's OK - create your first post

---

## ✅ Integration Checklist

After copying the template files, verify:

- [ ] `lib/auth/sign-message.ts` exists
- [ ] `lib/api/` folder has 8 API files
- [ ] `app/connect/page.tsx` updated with new code
- [ ] `app/dashboard/page.tsx` updated with new code
- [ ] `components/post-card.tsx` updated with new props
- [ ] `.env.local` configured correctly
- [ ] GMI-BE running on port 3001
- [ ] GMI-FE running on port 3000
- [ ] Can connect wallet and sign message
- [ ] Dashboard loads without errors

---

## 🐛 Troubleshooting

### Problem: "Failed to connect wallet"

**Check:**
1. Is GMI-BE running? (`http://localhost:3001/api/health`)
2. CORS configured correctly in GMI-BE?
3. Is wallet on Devnet?

**Solution:**
```bash
# Check backend health
curl http://localhost:3001/api/health

# Should return:
{"status":"ok","timestamp":"..."}
```

---

### Problem: "CORS policy error"

**Check GMI-BE server.ts:**
```typescript
app.use(cors({
  origin: 'http://localhost:3000', // ← Must match FE URL
  credentials: true
}))
```

---

### Problem: "Signature verification failed"

**Check:**
1. Did you install `bs58` in GMI-FE?
2. Is signature being sent in headers?
3. Check GMI-BE logs for error details

**Debug:**
```bash
# In GMI-FE, check browser console
console.log('Signature:', signature)

# In GMI-BE, check terminal logs
[Wallet] Verifying signature for: <address>
```

---

### Problem: "Database connection error"

**Check:**
1. DATABASE_URL correct in GMI-BE/.env?
2. Did you run `prisma:migrate`?
3. Is Supabase project active?

**Solution:**
```bash
cd GMI-BE
npm run prisma:studio  # Opens database GUI
# Check if tables exist: Wallet, Post, Comment, etc.
```

---

## 📁 File Changes Summary

### Files you need to replace:

| File | Location | Template |
|------|----------|----------|
| Connect page | `GMI-FE/app/connect/page.tsx` | `_templates/connect-page-new.tsx` |
| Dashboard page | `GMI-FE/app/dashboard/page.tsx` | `_templates/dashboard-page-new.tsx` |
| Post card | `GMI-FE/components/post-card.tsx` | `_templates/post-card-new.tsx` |

### New files created:

| File | Location | Purpose |
|------|----------|---------|
| Sign helper | `GMI-FE/lib/auth/sign-message.ts` | Wallet signature authentication |
| API client | `GMI-FE/lib/api/*.ts` | 8 API service files |

---

## 🎯 Next Steps

After basic integration works:

1. **Update remaining pages:**
   - [ ] `app/create/page.tsx` - Create post with signature
   - [ ] `app/post/[id]/page.tsx` - Post detail + comments
   - [ ] `app/my-projects/page.tsx` - User's posts
   - [ ] `app/profile/page.tsx` - User profile

2. **Add missing features:**
   - [ ] Comment creation
   - [ ] Tipping functionality
   - [ ] Prize ranking UI
   - [ ] Prize claiming

3. **Add Realtime:**
   - [ ] Live comments
   - [ ] Live tips
   - [ ] Prize notifications

4. **Smart Contract:**
   - [ ] Deploy to Devnet
   - [ ] Integrate with FE
   - [ ] Test prize distribution

---

## 📞 Need Help?

Check these files:
- [STEP-BY-STEP-INTEGRATION.md](STEP-BY-STEP-INTEGRATION.md) - Detailed guide
- [PROGRESS-SUMMARY.md](PROGRESS-SUMMARY.md) - Project overview
- [GMI-BE/README.md](GMI-BE/README.md) - Backend docs
- [GMI-FE/README.md](GMI-FE/README.md) - Frontend docs

---

**Current Status:** 🟢 Core infrastructure complete, basic integration ready to test!
