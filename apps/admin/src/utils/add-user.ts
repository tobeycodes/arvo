import { homedir } from "node:os";
import { join } from "node:path";
import idl from "@arvo/program/idl";
import type { Arvo } from "@arvo/program/types";
import { AnchorProvider, Program, Wallet, setProvider, web3 } from "@coral-xyz/anchor";

export const addUser = async (userPublicKey: string) => {
  const connection = new web3.Connection("https://api.devnet.solana.com", {
    commitment: "confirmed",
  });
  const walletPath = join(homedir(), ".config", "solana", "id.json");
  const walletFile = require(walletPath);
  const wallet = new Wallet(web3.Keypair.fromSecretKey(new Uint8Array(walletFile)));

  const provider = new AnchorProvider(connection, wallet);

  setProvider(provider);

  const program = new Program(idl, provider) as Program<Arvo>;

  const user = new web3.PublicKey(userPublicKey);

  await program.methods.addUser(user).rpc();
};
