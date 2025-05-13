use anchor_lang::prelude::*;

#[error_code]
pub enum ErrorCode {
    #[msg("You are not authorized to perform this action")]
    Unauthorized,

    #[msg("You are not verified")]
    NotVerified,
}
