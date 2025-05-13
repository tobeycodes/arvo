use anchor_lang::prelude::*;

#[constant]
pub const ADMIN_SEED: &[u8] = b"admin";

#[constant]
pub const USER_SEED: &[u8] = b"user";

#[constant]
pub const VAULT_SEED: &[u8] = b"vault";

#[constant]
pub const DEPOSIT_SEED: &[u8] = b"deposit";

#[constant]
pub const ADMIN_PUBLIC_KEY: Pubkey = pubkey!("H2S3PxG5jtpJt6MCUyqbrz5TigW5M7zQgkEMmLsyacaT");
