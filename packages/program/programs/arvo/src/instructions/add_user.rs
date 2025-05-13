use crate::{error::ErrorCode, state::User, Admin, ADMIN_SEED, USER_SEED};
use anchor_lang::prelude::*;

#[derive(Accounts)]
#[instruction(_user: Pubkey)]
pub struct AddUser<'info> {
    #[account(mut, signer)]
    pub authority: Signer<'info>,

    #[account(
      mut,
      seeds = [ADMIN_SEED],
      bump = admin.bump,
    )]
    pub admin: Account<'info, Admin>,

    #[account(
        init,
        payer = authority,
        space = User::DISCRIMINATOR.len() + User::INIT_SPACE,
        seeds = [USER_SEED, _user.key().as_ref()],
        bump,
    )]
    pub user: Account<'info, User>,

    pub system_program: Program<'info, System>,
}

pub fn handler(ctx: Context<AddUser>, user: Pubkey) -> Result<()> {
    require!(
        ctx.accounts.authority.key() == ctx.accounts.admin.authority,
        ErrorCode::Unauthorized
    );

    ctx.accounts.user.user = user;
    ctx.accounts.user.is_verified = true;
    ctx.accounts.user.bump = ctx.bumps.user;

    Ok(())
}
