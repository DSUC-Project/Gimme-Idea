use anchor_lang::prelude::*;
use anchor_spl::token::{self, Token, TokenAccount, Transfer};

use crate::state::PrizePool;
use crate::errors::ErrorCode;

#[derive(Accounts)]
pub struct EmergencyWithdraw<'info> {
    #[account(
        mut,
        has_one = owner @ ErrorCode::Unauthorized,
        close = owner
    )]
    pub prize_pool: Account<'info, PrizePool>,

    /// Escrow token account holding prize funds
    #[account(
        mut,
        seeds = [b"escrow", prize_pool.key().as_ref()],
        bump
    )]
    pub escrow_token_account: Account<'info, TokenAccount>,

    /// Owner's USDC token account (destination)
    #[account(mut)]
    pub owner_token_account: Account<'info, TokenAccount>,

    #[account(mut)]
    pub owner: Signer<'info>,

    pub token_program: Program<'info, Token>,
}

pub fn handler(ctx: Context<EmergencyWithdraw>) -> Result<()> {
    let prize_pool = &ctx.accounts.prize_pool;

    // Can only withdraw if:
    // 1. Winners not set yet (distributed = false), OR
    // 2. All prizes have been claimed
    require!(
        !prize_pool.distributed || prize_pool.all_claimed(),
        ErrorCode::AlreadyDistributed
    );

    // Get remaining balance
    let remaining_balance = ctx.accounts.escrow_token_account.amount;

    if remaining_balance > 0 {
        // Transfer remaining funds back to owner
        let post_id = prize_pool.post_id.as_bytes();
        let bump = prize_pool.bump;
        let seeds = &[b"prize_pool", post_id, &[bump]];
        let signer = &[&seeds[..]];

        let cpi_accounts = Transfer {
            from: ctx.accounts.escrow_token_account.to_account_info(),
            to: ctx.accounts.owner_token_account.to_account_info(),
            authority: prize_pool.to_account_info(),
        };
        let cpi_program = ctx.accounts.token_program.to_account_info();
        let cpi_ctx = CpiContext::new_with_signer(cpi_program, cpi_accounts, signer);

        token::transfer(cpi_ctx, remaining_balance)?;

        msg!("Emergency withdraw completed");
        msg!("Amount: {} USDC", remaining_balance);
    }

    // The prize_pool account will be closed automatically (see #[account] attribute)
    // and rent will be returned to owner

    Ok(())
}
