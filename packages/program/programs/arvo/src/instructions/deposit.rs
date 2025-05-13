use crate::{error::ErrorCode, User, USER_SEED};
use crate::{DepositState, DEPOSIT_SEED, VAULT_SEED};
use anchor_lang::prelude::*;
use anchor_spl::{
    associated_token::AssociatedToken,
    mint,
    token::Token,
    token_2022::Token2022,
    token_interface::{transfer_checked, Mint, TokenAccount, TransferChecked},
};

#[derive(Accounts)]
pub struct Deposit<'info> {
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
      init,
      payer = authority,
      associated_token::mint = mint,
      associated_token::authority = authority,
      associated_token::token_program = token_2022_program,
    )]
    pub mint_account: InterfaceAccount<'info, TokenAccount>,

    #[account(address = mint::USDC)]
    pub usdc_mint: InterfaceAccount<'info, Mint>,

    #[account(
      mut,
      associated_token::mint = usdc_mint,
      associated_token::authority = vault,
      associated_token::token_program = token_program,
    )]
    pub usdc_account: InterfaceAccount<'info, TokenAccount>,

    #[account(
      mut,
      associated_token::mint = usdc_mint,
      associated_token::authority = authority,
      associated_token::token_program = token_program,
    )]
    pub usdc_account_authority: InterfaceAccount<'info, TokenAccount>,

    #[account(
      init,
      payer = authority,
      seeds = [DEPOSIT_SEED, authority.key().as_ref()],
      space = DepositState::DISCRIMINATOR.len() + DepositState::INIT_SPACE,
      bump,
    )]
    pub deposit: Account<'info, DepositState>,

    pub token_program: Program<'info, Token>,

    pub token_2022_program: Program<'info, Token2022>,

    pub system_program: Program<'info, System>,

    pub associated_token_program: Program<'info, AssociatedToken>,
}

pub fn handler(ctx: Context<Deposit>, amount: u64) -> Result<()> {
    require!(ctx.accounts.user.is_verified, ErrorCode::NotVerified);

    ctx.accounts.deposit.bump = ctx.bumps.deposit;
    ctx.accounts.deposit.authority = ctx.accounts.authority.key();
    ctx.accounts.deposit.amount = amount;

    transfer_checked(
        CpiContext::new(
            ctx.accounts.token_program.to_account_info(),
            TransferChecked {
                mint: ctx.accounts.usdc_mint.to_account_info(),
                from: ctx.accounts.usdc_account_authority.to_account_info(),
                to: ctx.accounts.usdc_account.to_account_info(),
                authority: ctx.accounts.authority.to_account_info(),
            },
        ),
        amount,
        ctx.accounts.usdc_mint.decimals,
    )?;

    Ok(())
}
