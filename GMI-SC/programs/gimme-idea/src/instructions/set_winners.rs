use anchor_lang::prelude::*;

use crate::state::PrizePool;
use crate::errors::ErrorCode;

#[derive(Accounts)]
pub struct SetWinners<'info> {
    #[account(
        mut,
        has_one = owner @ ErrorCode::Unauthorized
    )]
    pub prize_pool: Account<'info, PrizePool>,

    pub owner: Signer<'info>,
}

pub fn handler(
    ctx: Context<SetWinners>,
    winners: Vec<Pubkey>,
) -> Result<()> {
    let prize_pool = &mut ctx.accounts.prize_pool;

    // Check if pool has ended
    let current_time = Clock::get()?.unix_timestamp;
    require!(
        prize_pool.has_ended(current_time),
        ErrorCode::PoolNotEnded
    );

    // Validate winners count matches distribution
    require!(
        winners.len() == prize_pool.winners_count as usize,
        ErrorCode::WinnersLengthMismatch
    );

    // Validate all winners are valid addresses (not system program)
    require!(
        winners.iter().all(|w| *w != Pubkey::default()),
        ErrorCode::InvalidWinner
    );

    // Set winners
    prize_pool.winners = winners.clone();

    // Initialize claimed array (all false)
    prize_pool.claimed = vec![false; winners.len()];

    // Mark as distributed (winners are set, ready for claiming)
    prize_pool.distributed = true;

    msg!("Winners set for post: {}", prize_pool.post_id);
    msg!("Winners: {:?}", winners);

    Ok(())
}
