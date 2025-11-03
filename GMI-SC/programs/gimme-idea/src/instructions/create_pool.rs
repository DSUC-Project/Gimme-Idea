use anchor_lang::prelude::*;
use anchor_spl::token::{self, Token, TokenAccount, Transfer};

use crate::state::PrizePool;
use crate::errors::ErrorCode;

#[derive(Accounts)]
#[instruction(post_id: String)]
pub struct CreatePool<'info> {
    #[account(
        init,
        payer = owner,
        space = PrizePool::SPACE,
        seeds = [b"prize_pool", post_id.as_bytes()],
        bump
    )]
    pub prize_pool: Account<'info, PrizePool>,

    /// Owner's USDC token account (source of funds)
    #[account(mut)]
    pub owner_token_account: Account<'info, TokenAccount>,

    /// Escrow token account to hold prize funds
    #[account(
        init,
        payer = owner,
        token::mint = usdc_mint,
        token::authority = prize_pool,
        seeds = [b"escrow", prize_pool.key().as_ref()],
        bump
    )]
    pub escrow_token_account: Account<'info, TokenAccount>,

    /// USDC mint
    /// CHECK: USDC mint address is validated in instruction
    pub usdc_mint: AccountInfo<'info>,

    #[account(mut)]
    pub owner: Signer<'info>,

    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
}

pub fn handler(
    ctx: Context<CreatePool>,
    post_id: String,
    total_amount: u64,
    distribution: Vec<u8>,
    ends_at: i64,
) -> Result<()> {
    let prize_pool = &mut ctx.accounts.prize_pool;

    // Validate post_id length
    require!(post_id.len() <= 64, ErrorCode::PostIdTooLong);

    // Validate winners count
    let winners_count = distribution.len();
    require!(
        winners_count > 0 && winners_count <= PrizePool::MAX_WINNERS,
        ErrorCode::InvalidWinnersCount
    );

    // Validate distribution sums to 100
    let sum: u8 = distribution.iter().sum();
    require!(sum == 100, ErrorCode::DistributionNotHundred);

    // Validate each percentage is > 0
    require!(
        distribution.iter().all(|&p| p > 0),
        ErrorCode::InvalidDistribution
    );

    // Validate amount
    require!(total_amount > 0, ErrorCode::InsufficientFunds);

    // Validate end time is in future
    let current_time = Clock::get()?.unix_timestamp;
    require!(ends_at > current_time, ErrorCode::PoolEnded);

    // Initialize prize pool
    prize_pool.owner = ctx.accounts.owner.key();
    prize_pool.post_id = post_id;
    prize_pool.usdc_mint = ctx.accounts.usdc_mint.key();
    prize_pool.total_amount = total_amount;
    prize_pool.winners_count = winners_count as u8;
    prize_pool.distribution = distribution;
    prize_pool.winners = Vec::new();
    prize_pool.claimed = Vec::new();
    prize_pool.total_claimed = 0;
    prize_pool.ends_at = ends_at;
    prize_pool.distributed = false;
    prize_pool.bump = ctx.bumps.prize_pool;

    // Transfer USDC from owner to escrow
    let cpi_accounts = Transfer {
        from: ctx.accounts.owner_token_account.to_account_info(),
        to: ctx.accounts.escrow_token_account.to_account_info(),
        authority: ctx.accounts.owner.to_account_info(),
    };
    let cpi_program = ctx.accounts.token_program.to_account_info();
    let cpi_ctx = CpiContext::new(cpi_program, cpi_accounts);

    token::transfer(cpi_ctx, total_amount)?;

    msg!("Prize pool created for post: {}", prize_pool.post_id);
    msg!("Total amount: {} USDC", total_amount);
    msg!("Winners count: {}", winners_count);

    Ok(())
}
