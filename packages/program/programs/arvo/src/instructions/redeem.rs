use anchor_lang::prelude::*;

#[derive(Accounts)]
pub struct Redeem {}

pub fn handler(_ctx: Context<Redeem>) -> Result<()> {
    Ok(())
}
