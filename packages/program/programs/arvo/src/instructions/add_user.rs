use anchor_lang::prelude::*;

#[derive(Accounts)]
pub struct AddUser {}

pub fn handler(_ctx: Context<AddUser>) -> Result<()> {
    Ok(())
}
