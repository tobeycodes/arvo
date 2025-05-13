use crate::{error::ErrorCode, Admin, ADMIN_SEED};
use anchor_lang::prelude::*;
use anchor_spl::token_interface::{
    interest_bearing_mint_update_rate, InterestBearingMintUpdateRate, Mint, Token2022,
};

#[derive(Accounts)]
pub struct UpdateRate<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,

    #[account(
      mut,
      seeds = [ADMIN_SEED],
      bump = admin.bump,
    )]
    pub admin: Account<'info, Admin>,

    #[account(mut)]
    pub mint: InterfaceAccount<'info, Mint>,

    pub token_program: Program<'info, Token2022>,

    pub system_program: Program<'info, System>,
}

pub fn handler(ctx: Context<UpdateRate>, rate: i16) -> Result<()> {
    require!(
        ctx.accounts.authority.key() == ctx.accounts.admin.authority,
        ErrorCode::Unauthorized
    );

    interest_bearing_mint_update_rate(
        CpiContext::new(
            ctx.accounts.token_program.to_account_info(),
            InterestBearingMintUpdateRate {
                token_program_id: ctx.accounts.token_program.to_account_info(),
                mint: ctx.accounts.mint.to_account_info(),
                rate_authority: ctx.accounts.authority.to_account_info(),
            },
        ),
        rate,
    )?;

    Ok(())
}
