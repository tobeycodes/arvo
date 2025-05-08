use anchor_lang::prelude::*;

#[derive(Accounts)]
pub struct UpdateMetadata {}

pub fn handler(_ctx: Context<UpdateMetadata>) -> Result<()> {
    Ok(())
}
