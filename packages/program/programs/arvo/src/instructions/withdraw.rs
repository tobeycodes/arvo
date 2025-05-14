use crate::{error::ErrorCode, User, USER_SEED};
use crate::{WithdrawState, VAULT_SEED, WITHDRAW_SEED};
use anchor_lang::prelude::*;
use anchor_spl::{
    associated_token::AssociatedToken,
    token_2022::Token2022,
    token_interface::{transfer_checked, Mint, TokenAccount, TransferChecked},
};

#[derive(Accounts)]
pub struct Withdraw<'info> {
    #[account(mut, signer)]
    pub authority: Signer<'info>,

    #[account(
      seeds = [USER_SEED, authority.key().as_ref()],
      bump = user.bump,
    )]
    pub user: Account<'info, User>,

    #[account(
      seeds = [VAULT_SEED],
      bump,
    )]
    pub vault: SystemAccount<'info>,

    pub mint: InterfaceAccount<'info, Mint>,

    #[account(
      mut,
      associated_token::mint = mint,
      associated_token::authority = vault,
      associated_token::token_program = token_program,
    )]
    pub mint_account: InterfaceAccount<'info, TokenAccount>,

    #[account(
      mut,
      associated_token::mint = mint,
      associated_token::authority = authority,
      associated_token::token_program = token_program,
    )]
    pub mint_account_authority: InterfaceAccount<'info, TokenAccount>,

    #[account(
      init,
      payer = authority,
      seeds = [WITHDRAW_SEED, authority.key().as_ref()],
      space = WithdrawState::DISCRIMINATOR.len() + WithdrawState::INIT_SPACE,
      bump,
    )]
    pub withdraw: Account<'info, WithdrawState>,

    pub token_program: Program<'info, Token2022>,

    pub system_program: Program<'info, System>,

    pub associated_token_program: Program<'info, AssociatedToken>,
}

pub fn handler(ctx: Context<Withdraw>, amount: u64) -> Result<()> {
    require!(ctx.accounts.user.is_verified, ErrorCode::NotVerified);

    ctx.accounts.withdraw.bump = ctx.bumps.withdraw;
    ctx.accounts.withdraw.authority = ctx.accounts.authority.key();
    ctx.accounts.withdraw.amount = amount;

    transfer_checked(
        CpiContext::new(
            ctx.accounts.token_program.to_account_info(),
            TransferChecked {
                mint: ctx.accounts.mint.to_account_info(),
                from: ctx.accounts.mint_account_authority.to_account_info(),
                to: ctx.accounts.mint_account.to_account_info(),
                authority: ctx.accounts.authority.to_account_info(),
            },
        ),
        amount,
        ctx.accounts.mint.decimals,
    )?;

    Ok(())
}
