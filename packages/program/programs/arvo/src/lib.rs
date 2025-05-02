#![allow(unexpected_cfgs)]
pub mod constants;
pub mod error;
pub mod instructions;
pub mod state;

use anchor_lang::prelude::*;

pub use constants::*;
pub use instructions::*;
// pub use state::*;

declare_id!("6Ty8ByqCLeRGHigsvyD6skD5MSMQDu2svhL8b4pf3Dhk");

#[program]
pub mod arvo {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        initialize::handler(ctx)
    }
}
