use anchor_lang::prelude::*;

#[derive(Accounts)]
pub struct UpdateFee {}

pub fn handler(_ctx: Context<UpdateFee>) -> Result<()> {
    Ok(())
}
