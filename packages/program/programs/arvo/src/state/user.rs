use anchor_lang::prelude::*;

#[account]
#[derive(InitSpace)]
pub struct User {
    pub user: Pubkey,

    pub is_verified: bool,

    pub bump: u8,
}
