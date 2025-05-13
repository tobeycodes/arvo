use crate::error::ErrorCode;
use crate::{Admin, DepositState, ADMIN_SEED, VAULT_SEED};
use anchor_lang::prelude::*;
use anchor_spl::{
    mint,
    token::Token,
    token_2022::Token2022,
    token_interface::{
        mint_to_checked, transfer_checked, Mint, MintToChecked, TokenAccount, TransferChecked,
    },
};

#[derive(Accounts)]
pub struct Collect<'info> {
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

    #[account(mut)]
    pub mint: InterfaceAccount<'info, Mint>,

    #[account(address = mint::USDC)]
    pub usdc_mint: InterfaceAccount<'info, Mint>,

    #[account(
      mut,
      associated_token::mint = usdc_mint,
      associated_token::authority = vault,
      associated_token::token_program = token_program,
    )]
    pub usdc_account: InterfaceAccount<'info, TokenAccount>,

    #[account(mut)]
    pub usdc_account_custody: InterfaceAccount<'info, TokenAccount>,

    pub token_program: Program<'info, Token>,

    pub token_2022_program: Program<'info, Token2022>,
}

pub fn handler<'info>(ctx: Context<'_, '_, '_, 'info, Collect<'info>>) -> Result<()> {
    require!(
        ctx.accounts.authority.key() == ctx.accounts.admin.authority,
        ErrorCode::Unauthorized
    );

    let accounts = &ctx.remaining_accounts;

    for chunk in accounts.chunks(2) {
        let deposit_account = &chunk[0];
        let ata_account = &chunk[1];
        let data = deposit_account.try_borrow_mut_data()?;
        let deposit = DepositState::try_deserialize(&mut data.as_ref())?;

        mint_to_checked(
            CpiContext::new(
                ctx.accounts.token_2022_program.to_account_info(),
                MintToChecked {
                    mint: ctx.accounts.mint.to_account_info(),
                    to: ata_account.to_account_info(),
                    authority: ctx.accounts.authority.to_account_info(),
                },
            ),
            deposit.amount,
            ctx.accounts.mint.decimals,
        )?;

        transfer_checked(
            CpiContext::new(
                ctx.accounts.token_program.to_account_info(),
                TransferChecked {
                    mint: ctx.accounts.usdc_mint.to_account_info(),
                    from: ctx.accounts.usdc_account.to_account_info(),
                    to: ctx.accounts.usdc_account_custody.to_account_info(),
                    authority: ctx.accounts.vault.to_account_info(),
                },
            )
            .with_signer(&[&[VAULT_SEED, &[ctx.bumps.vault]]]),
            deposit.amount,
            ctx.accounts.usdc_mint.decimals,
        )?;
    }

    Ok(())
}
