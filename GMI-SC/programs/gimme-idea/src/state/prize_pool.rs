use anchor_lang::prelude::*;

#[account]
#[derive(Default)]
pub struct PrizePool {
    /// Post owner who created the pool
    pub owner: Pubkey,

    /// Post ID from database (for reference)
    pub post_id: String,

    /// USDC mint address
    pub usdc_mint: Pubkey,

    /// Total amount in pool (in USDC smallest unit - 6 decimals)
    pub total_amount: u64,

    /// Number of winners
    pub winners_count: u8,

    /// Prize distribution percentages (must sum to 100)
    /// e.g., [50, 30, 20] for 3 winners
    pub distribution: Vec<u8>,

    /// Winners' wallet addresses (set by owner after ranking)
    pub winners: Vec<Pubkey>,

    /// Track which winners have claimed
    pub claimed: Vec<bool>,

    /// Total amount claimed so far
    pub total_claimed: u64,

    /// Timestamp when pool ends
    pub ends_at: i64,

    /// Whether all prizes have been distributed
    pub distributed: bool,

    /// Bump seed for PDA
    pub bump: u8,
}

impl PrizePool {
    /// Calculate space needed for this account
    /// 8 (discriminator) + 32 (owner) + 4+64 (post_id) + 32 (usdc_mint)
    /// + 8 (total_amount) + 1 (winners_count) + 4+max_winners (distribution)
    /// + 4+32*max_winners (winners) + 4+max_winners (claimed)
    /// + 8 (total_claimed) + 8 (ends_at) + 1 (distributed) + 1 (bump)
    /// max_winners = 10 for safety
    pub const MAX_WINNERS: usize = 10;
    pub const SPACE: usize = 8 + 32 + 4 + 64 + 32 + 8 + 1
        + (4 + Self::MAX_WINNERS)
        + (4 + 32 * Self::MAX_WINNERS)
        + (4 + Self::MAX_WINNERS)
        + 8 + 8 + 1 + 1
        + 100; // Extra padding for safety

    /// Check if pool has ended
    pub fn has_ended(&self, current_time: i64) -> bool {
        current_time >= self.ends_at
    }

    /// Check if all winners are set
    pub fn all_winners_set(&self) -> bool {
        self.winners.len() == self.winners_count as usize
    }

    /// Check if a specific winner has claimed
    pub fn has_claimed(&self, winner_index: usize) -> bool {
        if winner_index >= self.claimed.len() {
            return false;
        }
        self.claimed[winner_index]
    }

    /// Calculate prize amount for a specific rank
    pub fn calculate_prize(&self, rank: usize) -> Result<u64> {
        if rank >= self.distribution.len() {
            return Err(error!(crate::errors::ErrorCode::InvalidRank));
        }

        let percentage = self.distribution[rank] as u64;
        let amount = self.total_amount
            .checked_mul(percentage)
            .ok_or(error!(crate::errors::ErrorCode::MathOverflow))?
            .checked_div(100)
            .ok_or(error!(crate::errors::ErrorCode::MathOverflow))?;

        Ok(amount)
    }

    /// Check if all prizes have been claimed
    pub fn all_claimed(&self) -> bool {
        self.claimed.iter().all(|&claimed| claimed)
    }
}
