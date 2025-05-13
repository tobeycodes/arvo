import * as os from "os";
import * as path from "path";
import { Arvo } from "@arvo/program/types";
import {
  AnchorProvider,
  Program,
  setProvider,
  Wallet,
  web3,
} from "@coral-xyz/anchor";
import idl from "@arvo/program/idl";

export const addUser = async (userPublicKey: string) => {
  const connection = new web3.Connection("http://localhost:8899", {
    commitment: "confirmed",
  });
  const walletPath = path.join(os.homedir(), ".config", "solana", "id.json");
  const walletFile = require(walletPath);
  const wallet = new Wallet(
    web3.Keypair.fromSecretKey(new Uint8Array(walletFile)),
  );

  const provider = new AnchorProvider(connection, wallet);

  setProvider(provider);

  const program = new Program(idl, provider) as Program<Arvo>;

  const user = new web3.PublicKey(userPublicKey);

  const tx = await program.methods.addUser(user).rpc();

  console.log("Your transaction signature", tx);
};
