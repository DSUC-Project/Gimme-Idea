# 🚀 Gimme Idea Backend (GMI-BE)

Backend API for Gimme Idea - A Web3 feedback platform on Solana.

## 🏗️ Tech Stack

- **Framework:** Express.js + TypeScript
- **Database:** PostgreSQL (Supabase) with Prisma ORM
- **Blockchain:** Solana (Devnet) with Anchor smart contract
- **Authentication:** Wallet signature verification
- **Storage:** Supabase Storage for images

## 📁 Project Structure

```
GMI-BE/
├── src/
│   ├── config/          # Configuration files
│   ├── middleware/      # Express middleware
│   ├── routes/          # API route handlers
│   ├── services/        # Business logic
│   ├── prisma/          # Prisma schema
│   ├── types/           # TypeScript types
│   ├── utils/           # Utility functions
│   └── server.ts        # Main server file
├── .env                 # Environment variables
└── package.json
```

## 🚀 Quick Start

### 1. Install Dependencies

```bash
cd GMI-BE
npm install
```

### 2. Setup Environment Variables

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

Edit `.env` with your credentials:

```env
# Database (from Supabase)
DATABASE_URL="postgresql://..."

# Supabase
SUPABASE_URL="https://your-project.supabase.co"
SUPABASE_ANON_KEY="your-anon-key"
SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"

# Solana
SOLANA_NETWORK="devnet"
SOLANA_RPC_URL="https://api.devnet.solana.com"
PROGRAM_ID="(will be set after deploying smart contract)"

# Server
PORT=3001
NODE_ENV="development"
CORS_ORIGIN="http://localhost:3000"

# Access Code
ACCESS_CODE="GMI2025"
```

### 3. Setup Database

Generate Prisma client and run migrations:

```bash
npm run prisma:generate
npm run prisma:migrate
```

### 4. Start Development Server

```bash
npm run dev
```

Server will run on http://localhost:3001

## 📡 API Endpoints

### Authentication
- `POST /api/access` - Verify access code
- `POST /api/wallet/connect` - Connect wallet

### Posts
- `GET /api/posts` - List all posts
- `POST /api/posts` - Create new post
- `GET /api/posts/:id` - Get post detail
- `PUT /api/posts/:id` - Update post
- `DELETE /api/posts/:id` - Delete post

### Comments
- `GET /api/posts/:id/comments` - Get comments
- `POST /api/posts/:id/comments` - Add comment

### Rankings
- `POST /api/posts/:id/rank` - Rank a comment
- `GET /api/posts/:id/rankings` - Get rankings

### Prizes
- `POST /api/prizes/:id/claim` - Claim prize
- `POST /api/prizes/:id/distribute` - Distribute prizes

### Tips
- `POST /api/tips/send` - Send tip
- `GET /api/tips/:wallet` - Get tip history

### Upload
- `POST /api/upload` - Upload image

## 🔐 Authentication

All protected endpoints require:
- `x-access-code: GMI2025` header
- `x-wallet-address: <wallet_address>` header
- `x-wallet-signature: <signature>` header (for write operations)

## 🗄️ Database Schema

See `src/prisma/schema.prisma` for full schema.

**Main tables:**
- `Wallet` - User wallets
- `Post` - Project posts
- `PrizePool` - Prize pool configuration
- `Comment` - Feedback comments
- `Ranking` - Prize rankings
- `Tip` - Tipping transactions

## 🔧 Development

### Run Prisma Studio (Database GUI)
```bash
npm run prisma:studio
```

### Generate Prisma Client
```bash
npm run prisma:generate
```

### Create Migration
```bash
npm run prisma:migrate
```

## 🚢 Deployment

### Deploy to Railway

1. Push code to GitHub
2. Connect Railway to your repo
3. Set environment variables
4. Deploy!

Railway will auto-detect and deploy Node.js app.

## 📝 Next Steps

1. ✅ Basic structure created
2. ⏳ Implement API routes
3. ⏳ Integrate smart contract
4. ⏳ Add realtime subscriptions
5. ⏳ Deploy to Railway

## 🤝 Contributing

This is the backend for Gimme Idea MVP.

## 📄 License

MIT
