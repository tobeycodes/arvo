use crate::error::ErrorCode;
use crate::{Admin, ADMIN_PUBLIC_KEY, ADMIN_SEED};
use anchor_lang::prelude::*;
use anchor_lang::system_program::{create_account, CreateAccount};
use anchor_spl::{
    associated_token::AssociatedToken,
    token_2022::{
        initialize_mint2,
        spl_token_2022::{extension::ExtensionType, pod::PodMint},
        InitializeMint2,
    },
    token_2022_extensions::{metadata_pointer_initialize, MetadataPointerInitialize},
    token_interface::{
        interest_bearing_mint_initialize, token_metadata_initialize, InterestBearingMintInitialize,
        Token2022, TokenMetadataInitialize,
    },
};
use spl_token_metadata_interface::state::TokenMetadata;
use spl_type_length_value::variable_len_pack::VariableLenPack;

#[derive(Accounts)]
#[instruction(args: InitializeArgs)]
pub struct Initialize<'info> {
    #[account(mut, signer)]
    pub authority: Signer<'info>,

    #[account(
        init,
        payer = authority,
        space = Admin::DISCRIMINATOR.len() + Admin::INIT_SPACE,
        seeds = [ADMIN_SEED],
        bump
    )]
    pub admin: Account<'info, Admin>,

    #[account(mut, signer)]
    pub mint: Signer<'info>,

    pub token_program: Program<'info, Token2022>,

    pub system_program: Program<'info, System>,

    pub associated_token_program: Program<'info, AssociatedToken>,
}

#[derive(AnchorDeserialize, AnchorSerialize)]
pub struct InitializeArgs {
    pub rate: i16,

    pub name: String,

    pub symbol: String,

    pub uri: String,
}

pub fn handler(ctx: Context<Initialize>, args: InitializeArgs) -> Result<()> {
    require!(
        ctx.accounts.authority.key() == ADMIN_PUBLIC_KEY,
        ErrorCode::Unauthorized
    );

    let InitializeArgs {
        rate,
        name,
        symbol,
        uri,
    } = args;

    ctx.accounts.admin.authority = ctx.accounts.authority.key();
    ctx.accounts.admin.bump = ctx.bumps.admin;

    let mint_size = ExtensionType::try_calculate_account_len::<PodMint>(&[
        ExtensionType::InterestBearingConfig,
        ExtensionType::MetadataPointer,
    ])?;

    let token_metadata = TokenMetadata {
        name: name.clone(),
        symbol: symbol.clone(),
        uri: uri.clone(),
        ..Default::default()
    };

    let data_len = 4 + token_metadata.get_packed_len()?;

    let lamports = Rent::get()?.minimum_balance(mint_size + data_len);

    create_account(
        CpiContext::new(
            ctx.accounts.system_program.to_account_info(),
            CreateAccount {
                from: ctx.accounts.authority.to_account_info(),
                to: ctx.accounts.mint.to_account_info(),
            },
        ),
        lamports,
        mint_size as u64,
        &ctx.accounts.token_program.key(),
    )?;

    metadata_pointer_initialize(
        CpiContext::new(
            ctx.accounts.token_program.to_account_info(),
            MetadataPointerInitialize {
                token_program_id: ctx.accounts.token_program.to_account_info(),
                mint: ctx.accounts.mint.to_account_info(),
            },
        ),
        Some(ctx.accounts.authority.key()),
        Some(ctx.accounts.mint.key()),
    )?;

    interest_bearing_mint_initialize(
        CpiContext::new(
            ctx.accounts.token_program.to_account_info(),
            InterestBearingMintInitialize {
                token_program_id: ctx.accounts.token_program.to_account_info(),
                mint: ctx.accounts.mint.to_account_info(),
            },
        ),
        Some(ctx.accounts.authority.key()),
        rate,
    )?;

    initialize_mint2(
        CpiContext::new(
            ctx.accounts.token_program.to_account_info(),
            InitializeMint2 {
                mint: ctx.accounts.mint.to_account_info(),
            },
        ),
        6,
        &ctx.accounts.authority.key(),
        Some(&ctx.accounts.authority.key()),
    )?;

    token_metadata_initialize(
        CpiContext::new(
            ctx.accounts.token_program.to_account_info(),
            TokenMetadataInitialize {
                program_id: ctx.accounts.token_program.to_account_info(),
                mint: ctx.accounts.mint.to_account_info(),
                metadata: ctx.accounts.mint.to_account_info(),
                mint_authority: ctx.accounts.authority.to_account_info(),
                update_authority: ctx.accounts.authority.to_account_info(),
            },
        ),
        name,
        symbol,
        uri,
    )?;

    Ok(())
}
