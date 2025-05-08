use anchor_lang::prelude::*;

#[derive(Accounts)]
pub struct RemoveUser {}

pub fn handler(_ctx: Context<RemoveUser>) -> Result<()> {
    Ok(())
}
