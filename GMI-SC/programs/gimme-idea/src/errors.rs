use anchor_lang::prelude::*;

#[error_code]
pub enum ErrorCode {
    #[msg("Pool has not ended yet")]
    PoolNotEnded,

    #[msg("Pool has already ended")]
    PoolEnded,

    #[msg("Invalid number of winners")]
    InvalidWinnersCount,

    #[msg("Invalid distribution percentages")]
    InvalidDistribution,

    #[msg("Distribution must sum to 100")]
    DistributionNotHundred,

    #[msg("Winners array length mismatch")]
    WinnersLengthMismatch,

    #[msg("All winners must be set before claiming")]
    WinnersNotSet,

    #[msg("Invalid winner address")]
    InvalidWinner,

    #[msg("Prize already claimed")]
    AlreadyClaimed,

    #[msg("Invalid rank")]
    InvalidRank,

    #[msg("Math overflow")]
    MathOverflow,

    #[msg("Insufficient funds in pool")]
    InsufficientFunds,

    #[msg("Only owner can perform this action")]
    Unauthorized,

    #[msg("Pool already distributed")]
    AlreadyDistributed,

    #[msg("Post ID too long (max 64 chars)")]
    PostIdTooLong,
}
