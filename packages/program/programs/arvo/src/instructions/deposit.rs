use anchor_lang::prelude::*;

#[derive(Accounts)]
pub struct Deposit {}

pub fn handler(_ctx: Context<Deposit>) -> Result<()> {
    Ok(())
}
