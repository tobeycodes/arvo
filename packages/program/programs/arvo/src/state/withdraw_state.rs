use anchor_lang::prelude::*;

#[account]
#[derive(InitSpace)]
pub struct WithdrawState {
    pub bump: u8,

    pub authority: Pubkey,

    pub amount: u64,
}
