#![allow(unexpected_cfgs)]
pub mod constants;
pub mod error;
pub mod instructions;
pub mod state;

use anchor_lang::prelude::*;

pub use constants::*;
pub use instructions::*;
// pub use state::*;

declare_id!("8ngTZNrGPpnj3a1A9Bq9p7RGPEBxZmk3JmKhACknvpQK");

#[program]
pub mod arvo {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        initialize::handler(ctx)
    }
}
