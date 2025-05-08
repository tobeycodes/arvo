use anchor_lang::prelude::*;

#[derive(Accounts)]
pub struct UpdateAuthority {}

pub fn handler(_ctx: Context<UpdateAuthority>) -> Result<()> {
    Ok(())
}
