use crate::{error::ErrorCode, state::User, Admin, ADMIN_SEED, USER_SEED};
use anchor_lang::prelude::*;

#[derive(Accounts)]
#[instruction(_user: Pubkey)]
pub struct RemoveUser<'info> {
    #[account(mut, signer)]
    pub authority: Signer<'info>,

    #[account(
      mut,
      seeds = [ADMIN_SEED],
      bump = admin.bump,
    )]
    pub admin: Account<'info, Admin>,

    #[account(
        mut,
        close = authority,
        seeds = [USER_SEED, _user.key().as_ref()],
        bump,
    )]
    pub user: Account<'info, User>,

    pub system_program: Program<'info, System>,
}

pub fn handler(ctx: Context<RemoveUser>, _user: Pubkey) -> Result<()> {
    require!(
        ctx.accounts.authority.key() == ctx.accounts.admin.authority,
        ErrorCode::Unauthorized
    );

    Ok(())
}
