use anchor_lang::prelude::*;

#[derive(Accounts)]
pub struct UpdateRate {}

pub fn handler(_ctx: Context<UpdateRate>) -> Result<()> {
    Ok(())
}
