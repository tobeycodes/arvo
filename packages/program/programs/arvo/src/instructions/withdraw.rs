use anchor_lang::prelude::*;

#[derive(Accounts)]
pub struct Withdraw {}

pub fn handler(_ctx: Context<Withdraw>) -> Result<()> {
    Ok(())
}
