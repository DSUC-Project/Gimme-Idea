use anchor_lang::prelude::*;
use anchor_spl::token::{self, Token, TokenAccount, Transfer};

use crate::state::PrizePool;
use crate::errors::ErrorCode;

#[derive(Accounts)]
pub struct ClaimPrize<'info> {
    #[account(mut)]
    pub prize_pool: Account<'info, PrizePool>,

    /// Escrow token account holding prize funds
    #[account(
        mut,
        seeds = [b"escrow", prize_pool.key().as_ref()],
        bump
    )]
    pub escrow_token_account: Account<'info, TokenAccount>,

    /// Winner's USDC token account (destination)
    #[account(mut)]
    pub winner_token_account: Account<'info, TokenAccount>,

    #[account(mut)]
    pub winner: Signer<'info>,

    pub token_program: Program<'info, Token>,
}

pub fn handler(ctx: Context<ClaimPrize>) -> Result<()> {
    let prize_pool = &mut ctx.accounts.prize_pool;

    // Check if winners are set
    require!(prize_pool.distributed, ErrorCode::WinnersNotSet);

    // Find winner index
    let winner_pubkey = ctx.accounts.winner.key();
    let winner_index = prize_pool
        .winners
        .iter()
        .position(|w| *w == winner_pubkey)
        .ok_or(ErrorCode::InvalidWinner)?;

    // Check if already claimed
    require!(
        !prize_pool.has_claimed(winner_index),
        ErrorCode::AlreadyClaimed
    );

    // Calculate prize amount
    let prize_amount = prize_pool.calculate_prize(winner_index)?;

    // Check escrow has sufficient funds
    require!(
        ctx.accounts.escrow_token_account.amount >= prize_amount,
        ErrorCode::InsufficientFunds
    );

    // Mark as claimed
    prize_pool.claimed[winner_index] = true;
    prize_pool.total_claimed = prize_pool
        .total_claimed
        .checked_add(prize_amount)
        .ok_or(ErrorCode::MathOverflow)?;

    // Transfer prize from escrow to winner
    let post_id = prize_pool.post_id.as_bytes();
    let bump = prize_pool.bump;
    let seeds = &[b"prize_pool", post_id, &[bump]];
    let signer = &[&seeds[..]];

    let cpi_accounts = Transfer {
        from: ctx.accounts.escrow_token_account.to_account_info(),
        to: ctx.accounts.winner_token_account.to_account_info(),
        authority: prize_pool.to_account_info(),
    };
    let cpi_program = ctx.accounts.token_program.to_account_info();
    let cpi_ctx = CpiContext::new_with_signer(cpi_program, cpi_accounts, signer);

    token::transfer(cpi_ctx, prize_amount)?;

    msg!("Prize claimed by winner #{}", winner_index + 1);
    msg!("Amount: {} USDC", prize_amount);
    msg!("Winner: {}", winner_pubkey);

    Ok(())
}
