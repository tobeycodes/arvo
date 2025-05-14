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
pub const WITHDRAW_SEED: &[u8] = b"withdraw";

#[constant]
pub const ADMIN_PUBLIC_KEY: Pubkey = pubkey!("H2S3PxG5jtpJt6MCUyqbrz5TigW5M7zQgkEMmLsyacaT");

#[constant]
pub const USDC_DEVNET_KEY: Pubkey = pubkey!("4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU");
