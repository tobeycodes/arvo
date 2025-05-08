#![allow(unexpected_cfgs)]
#![allow(ambiguous_glob_reexports)]

use anchor_lang::prelude::*;

pub mod constants;
pub use constants::*;

pub mod error;

pub mod instructions;
pub use instructions::*;

pub mod state;
// pub use state::*;

declare_id!("8ngTZNrGPpnj3a1A9Bq9p7RGPEBxZmk3JmKhACknvpQK");

#[program]
pub mod arvo {
    use super::*;

    pub fn add_user(ctx: Context<AddUser>) -> Result<()> {
        add_user::handler(ctx)
    }

    pub fn deposit(ctx: Context<Deposit>) -> Result<()> {
        deposit::handler(ctx)
    }

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        initialize::handler(ctx)
    }

    pub fn remove_user(ctx: Context<RemoveUser>) -> Result<()> {
        remove_user::handler(ctx)
    }

    pub fn update_authority(ctx: Context<UpdateAuthority>) -> Result<()> {
        update_authority::handler(ctx)
    }

    pub fn update_fee(ctx: Context<UpdateFee>) -> Result<()> {
        update_fee::handler(ctx)
    }

    pub fn update_metadata(ctx: Context<UpdateMetadata>) -> Result<()> {
        update_metadata::handler(ctx)
    }

    pub fn update_rate(ctx: Context<UpdateRate>) -> Result<()> {
        update_rate::handler(ctx)
    }

    pub fn withdraw(ctx: Context<Withdraw>) -> Result<()> {
        withdraw::handler(ctx)
    }
}
