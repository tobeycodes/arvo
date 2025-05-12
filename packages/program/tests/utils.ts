import { web3 } from "@coral-xyz/anchor";

let cachedMint: web3.Keypair | null = null;

export const mintKeypair = (): web3.Keypair => {
  if (!cachedMint) {
    cachedMint = web3.Keypair.generate();
  }

  return cachedMint;
};

let cachedUser: web3.Keypair | null = null;

export const userKeypair = (): web3.Keypair => {
  if (!cachedUser) {
    cachedUser = web3.Keypair.generate();
  }

  return cachedUser;
};
