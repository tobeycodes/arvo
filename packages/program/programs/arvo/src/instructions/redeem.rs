use crate::error::ErrorCode;
use crate::{Admin, WithdrawState, ADMIN_SEED, VAULT_SEED};
use anchor_lang::prelude::*;
use anchor_spl::{
    mint,
    token::Token,
    token_2022::{
        spl_token_2022::{
            extension::{
                interest_bearing_mint::InterestBearingConfig, BaseStateWithExtensions,
                StateWithExtensions,
            },
            state::Mint as MintState,
        },
        Token2022,
    },
    token_interface::{
        burn_checked, transfer_checked, BurnChecked, Mint, TokenAccount, TransferChecked,
    },
};

#[derive(Accounts)]
pub struct Redeem<'info> {
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

    #[account(
      mut,
      associated_token::mint = mint,
      associated_token::authority = vault,
      associated_token::token_program = token_2022_program,
    )]
    pub mint_account: InterfaceAccount<'info, TokenAccount>,

    pub token_program: Program<'info, Token>,

    pub token_2022_program: Program<'info, Token2022>,
}

pub fn handler<'info>(ctx: Context<'_, '_, '_, 'info, Redeem<'info>>) -> Result<()> {
    require!(
        ctx.accounts.authority.key() == ctx.accounts.admin.authority,
        ErrorCode::Unauthorized
    );

    let accounts = &ctx.remaining_accounts;

    for chunk in accounts.chunks(2) {
        let withdraw_account = &chunk[0];
        let ata_account = &chunk[1];

        let amount = {
            let mint_info = ctx.accounts.mint.to_account_info();
            let mint_data = mint_info.data.borrow();
            let mint_state = StateWithExtensions::<MintState>::unpack(&mint_data)?;
            let interest_bearing_config = mint_state.get_extension::<InterestBearingConfig>()?;
            let clock = Clock::get()?;
            let amount = interest_bearing_config.amount_to_ui_amount(
                1_000_000,
                ctx.accounts.mint.decimals,
                clock.unix_timestamp,
            );

            amount
                .map(|s| s.parse::<f64>().unwrap_or(0.0))
                .unwrap_or(0.0)
        };

        let withdraw_amount = {
            let data = withdraw_account.try_borrow_mut_data()?;
            let withdraw = WithdrawState::try_deserialize(&mut data.as_ref())?;

            withdraw.amount
        };

        let redeem_amount = (withdraw_amount as f64 * amount) as u64;

        burn_checked(
            CpiContext::new(
                ctx.accounts.token_2022_program.to_account_info(),
                BurnChecked {
                    mint: ctx.accounts.mint.to_account_info(),
                    from: ctx.accounts.mint_account.to_account_info(),
                    authority: ctx.accounts.vault.to_account_info(),
                },
            )
            .with_signer(&[&[VAULT_SEED, &[ctx.bumps.vault]]]),
            withdraw_amount,
            ctx.accounts.mint.decimals,
        )?;

        transfer_checked(
            CpiContext::new(
                ctx.accounts.token_program.to_account_info(),
                TransferChecked {
                    mint: ctx.accounts.usdc_mint.to_account_info(),
                    from: ctx.accounts.usdc_account.to_account_info(),
                    to: ata_account.to_account_info(),
                    authority: ctx.accounts.vault.to_account_info(),
                },
            )
            .with_signer(&[&[VAULT_SEED, &[ctx.bumps.vault]]]),
            redeem_amount,
            ctx.accounts.usdc_mint.decimals,
        )?;
    }

    Ok(())
}
