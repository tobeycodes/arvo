use anchor_lang::prelude::*;

#[account]
#[derive(InitSpace)]
pub struct DepositState {
    pub bump: u8,

    pub authority: Pubkey,

    pub amount: u64,
}
