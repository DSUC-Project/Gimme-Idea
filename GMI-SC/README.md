# 🎯 Gimme Idea Smart Contract (GMI-SC)

Solana smart contract for Gimme Idea prize pool system, built with Anchor Framework.

## 🏗️ Architecture

This smart contract manages prize pools for posts with the following features:
- **Create Pool**: Post owner creates a prize pool with USDC
- **Set Winners**: Post owner sets winners after ranking period ends
- **Claim Prize**: Winners claim their prizes
- **Emergency Withdraw**: Owner can withdraw if needed

## 📦 Program Structure

```
GMI-SC/
├── programs/
│   └── gimme-idea/
│       ├── Cargo.toml
│       └── src/
│           ├── lib.rs              # Main program
│           ├── errors.rs           # Custom errors
│           ├── state/
│           │   ├── mod.rs
│           │   └── prize_pool.rs   # PrizePool account
│           └── instructions/
│               ├── mod.rs
│               ├── create_pool.rs
│               ├── set_winners.rs
│               ├── claim_prize.rs
│               └── emergency_withdraw.rs
├── Anchor.toml
└── Cargo.toml
```

## 🚀 Instructions

### 1. create_pool

Creates a new prize pool for a post.

**Parameters:**
- `post_id: String` - Database post ID (max 64 chars)
- `total_amount: u64` - Total USDC in pool (6 decimals, e.g., 100000000 = 100 USDC)
- `distribution: Vec<u8>` - Prize percentages (must sum to 100, e.g., [50, 30, 20])
- `ends_at: i64` - Unix timestamp when pool ends

**Accounts:**
- `prize_pool` - PDA for prize pool state
- `owner_token_account` - Owner's USDC account (source)
- `escrow_token_account` - Escrow PDA holding prize funds
- `usdc_mint` - USDC mint address
- `owner` - Signer (post owner)

**Flow:**
1. Validates inputs (distribution sums to 100, ends_at in future)
2. Creates PrizePool PDA with seed: `["prize_pool", post_id]`
3. Creates escrow token account PDA
4. Transfers USDC from owner to escrow

### 2. set_winners

Sets winners after ranking period ends (owner only).

**Parameters:**
- `winners: Vec<Pubkey>` - Winner wallet addresses in rank order

**Accounts:**
- `prize_pool` - PrizePool PDA
- `owner` - Signer (must match pool owner)

**Validations:**
- Pool must have ended
- Winners count must match distribution length
- All winners must be valid addresses

### 3. claim_prize

Winner claims their prize.

**Parameters:** None (winner determined from signer)

**Accounts:**
- `prize_pool` - PrizePool PDA
- `escrow_token_account` - Escrow holding funds
- `winner_token_account` - Winner's USDC account (destination)
- `winner` - Signer (must be in winners array)

**Flow:**
1. Validates winner is in winners array
2. Checks prize not already claimed
3. Calculates prize amount from distribution
4. Transfers USDC from escrow to winner
5. Marks as claimed

### 4. emergency_withdraw

Owner withdraws remaining funds (only if winners not set or all claimed).

**Accounts:**
- `prize_pool` - PrizePool PDA (will be closed)
- `escrow_token_account` - Escrow account
- `owner_token_account` - Owner's USDC account
- `owner` - Signer

**Use Cases:**
- No participants after pool ends
- All prizes claimed, want to close account
- Emergency situations

## 🛠️ Development

### Prerequisites

```bash
# Install Rust
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh

# Install Solana CLI
sh -c "$(curl -sSfL https://release.solana.com/stable/install)"

# Install Anchor (v0.30.1)
cargo install --git https://github.com/coral-xyz/anchor avm --locked --force
avm install 0.30.1
avm use 0.30.1
```

### Build

```bash
anchor build
```

### Test (Local)

```bash
# Start local validator
solana-test-validator

# Run tests
anchor test --skip-local-validator
```

### Deploy to Devnet

```bash
# Configure Solana CLI for devnet
solana config set --url devnet

# Airdrop SOL for deployment (if needed)
solana airdrop 2

# Build
anchor build

# Deploy
anchor deploy

# Get program ID
solana address -k target/deploy/gimme_idea-keypair.json
```

**Update Program ID:**

After deployment, update:
1. `Anchor.toml`: `[programs.devnet]` section
2. `lib.rs`: `declare_id!()` macro

Then rebuild and redeploy.

## 📊 State Accounts

### PrizePool

```rust
pub struct PrizePool {
    pub owner: Pubkey,              // Post owner
    pub post_id: String,            // Database reference
    pub usdc_mint: Pubkey,          // USDC mint
    pub total_amount: u64,          // Total prize in pool
    pub winners_count: u8,          // Number of winners
    pub distribution: Vec<u8>,      // Prize percentages
    pub winners: Vec<Pubkey>,       // Winner addresses
    pub claimed: Vec<bool>,         // Claim status
    pub total_claimed: u64,         // Total amount claimed
    pub ends_at: i64,               // End timestamp
    pub distributed: bool,          // Winners set?
    pub bump: u8,                   // PDA bump
}
```

**PDA Seeds:**
- PrizePool: `["prize_pool", post_id]`
- Escrow: `["escrow", prize_pool_pubkey]`

**Space:** ~600 bytes (supports up to 10 winners)

## 🔐 Security

- **Authorization**: Only owner can create/set_winners/emergency_withdraw
- **Validation**: All inputs validated (distribution, timestamps, amounts)
- **PDA Authority**: Escrow controlled by PrizePool PDA, not owner
- **Double Claim Prevention**: Tracks claimed status per winner
- **Math Safety**: Uses checked arithmetic to prevent overflow

## 🌐 Integration with Backend

Backend should:
1. Call `create_pool` when user creates post with prize
2. Store `escrowPda` and `escrowTx` in database
3. After ranking, call `set_winners` with ranked wallets
4. Allow winners to call `claim_prize` from frontend
5. Update database when prizes claimed (listen to tx events)

## 📝 Example Usage

```typescript
// 1. Create pool (100 USDC, 3 winners: 50%, 30%, 20%)
await program.methods
  .createPool(
    "post_123",
    100_000_000, // 100 USDC
    [50, 30, 20],
    endTimestamp
  )
  .accounts({ ... })
  .rpc()

// 2. Set winners (after ranking)
await program.methods
  .setWinners([winner1, winner2, winner3])
  .accounts({ ... })
  .rpc()

// 3. Claim prize (as winner)
await program.methods
  .claimPrize()
  .accounts({ ... })
  .rpc()
```

## 🐛 Error Codes

- `PoolNotEnded` - Cannot set winners before end time
- `PoolEnded` - Cannot create pool with past end time
- `InvalidDistribution` - Distribution doesn't sum to 100
- `WinnersNotSet` - Cannot claim before winners set
- `AlreadyClaimed` - Prize already claimed
- `Unauthorized` - Only owner can perform action
- `InsufficientFunds` - Escrow has insufficient balance

## 📄 License

MIT
