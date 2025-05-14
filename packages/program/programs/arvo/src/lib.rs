#![allow(unexpected_cfgs)]
#![allow(ambiguous_glob_reexports)]

use anchor_lang::prelude::*;

pub mod constants;
pub use constants::*;

pub mod error;

pub mod instructions;
pub use instructions::*;

pub mod state;
pub use state::*;

declare_id!("5DH1XTTYRWJo2SeYaVtyTcf2mKHExXQb48bUCoX99vPf");

#[program]
pub mod arvo {
    use super::*;

    pub fn add_user(ctx: Context<AddUser>, user: Pubkey) -> Result<()> {
        add_user::handler(ctx, user)
    }

    pub fn collect<'info>(ctx: Context<'_, '_, '_, 'info, Collect<'info>>) -> Result<()> {
        collect::handler(ctx)
    }

    pub fn create_vault(ctx: Context<CreateVault>) -> Result<()> {
        create_vault::handler(ctx)
    }

    pub fn deposit(ctx: Context<Deposit>, amount: u64) -> Result<()> {
        deposit::handler(ctx, amount)
    }

    pub fn initialize(ctx: Context<Initialize>, args: InitializeArgs) -> Result<()> {
        initialize::handler(ctx, args)
    }

    pub fn redeem<'info>(ctx: Context<'_, '_, '_, 'info, Redeem<'info>>) -> Result<()> {
        redeem::handler(ctx)
    }

    pub fn remove_user(ctx: Context<RemoveUser>, user: Pubkey) -> Result<()> {
        remove_user::handler(ctx, user)
    }

    pub fn update_rate(ctx: Context<UpdateRate>, rate: i16) -> Result<()> {
        update_rate::handler(ctx, rate)
    }

    pub fn withdraw(ctx: Context<Withdraw>, amount: u64) -> Result<()> {
        withdraw::handler(ctx, amount)
    }
}
