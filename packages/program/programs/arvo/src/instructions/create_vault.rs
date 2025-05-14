use crate::{error::ErrorCode, Admin, ADMIN_SEED, USDC_DEVNET_KEY, VAULT_SEED};
use anchor_lang::prelude::*;
use anchor_spl::{
    associated_token::AssociatedToken,
    token::Token,
    token_2022::Token2022,
    token_interface::{Mint, TokenAccount},
};

#[derive(Accounts)]
pub struct CreateVault<'info> {
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
      seeds = [VAULT_SEED],
      bump,
    )]
    pub vault: SystemAccount<'info>,

    pub mint: InterfaceAccount<'info, Mint>,

    #[account(
      init,
      payer = authority,
      associated_token::mint = mint,
      associated_token::authority = vault,
      associated_token::token_program = token_2022_program,
    )]
    pub mint_account: InterfaceAccount<'info, TokenAccount>,

    #[account(address = USDC_DEVNET_KEY)]
    pub usdc_mint: InterfaceAccount<'info, Mint>,

    #[account(
        init,
        payer = authority,
        associated_token::mint = usdc_mint,
        associated_token::authority = vault,
        associated_token::token_program = token_program,
    )]
    pub usdc_account: InterfaceAccount<'info, TokenAccount>,

    pub token_program: Program<'info, Token>,

    pub token_2022_program: Program<'info, Token2022>,

    pub associated_token_program: Program<'info, AssociatedToken>,

    pub system_program: Program<'info, System>,
}

pub fn handler(ctx: Context<CreateVault>) -> Result<()> {
    require!(
        ctx.accounts.authority.key() == ctx.accounts.admin.authority,
        ErrorCode::Unauthorized
    );

    Ok(())
}
