import { AnchorProvider, type Program, setProvider, web3, workspace } from "@coral-xyz/anchor";
import {
  TOKEN_2022_PROGRAM_ID,
  getAssociatedTokenAddress,
  getOrCreateAssociatedTokenAccount,
} from "@solana/spl-token";
import { BN } from "bn.js";
import { expect } from "chai";
import { describe, it } from "mocha";
import type { Arvo } from "../target/types/arvo";
import { mintKeypair, userKeypair } from "./utils";

describe("withdraw", () => {
  const provider = AnchorProvider.env();
  setProvider(provider);

  const program = workspace.arvo as Program<Arvo>;
  const connection = provider.connection;

  it("can make a withdraw", async () => {
    const user = userKeypair();
    const mint = mintKeypair();

    const userMintAccount = await getOrCreateAssociatedTokenAccount(
      connection,
      user,
      mint.publicKey,
      user.publicKey,
      false,
      "confirmed",
      {},
      TOKEN_2022_PROGRAM_ID,
    );

    const amountToWithdraw = 50_000_000;

    const [vaultPda] = web3.PublicKey.findProgramAddressSync(
      [Buffer.from("vault")],
      program.programId,
    );

    const mintAta = await getAssociatedTokenAddress(
      mint.publicKey,
      vaultPda,
      true,
      TOKEN_2022_PROGRAM_ID,
    );

    await program.methods
      .withdraw(new BN(amountToWithdraw))
      .accounts({
        mint: mint.publicKey,
        authority: user.publicKey,
      })
      .signers([user])
      .rpc();

    const mintUserNewBalance = await connection.getTokenAccountBalance(userMintAccount.address);

    const mintVaultNewBalance = await connection.getTokenAccountBalance(mintAta);

    expect(Math.floor(mintUserNewBalance.value.uiAmount ?? 0)).to.equal(49);

    expect(Math.floor(mintVaultNewBalance.value.uiAmount ?? 0)).to.equal(50);

    const [withdrawPda] = web3.PublicKey.findProgramAddressSync(
      [Buffer.from("withdraw"), user.publicKey.toBuffer()],
      program.programId,
    );

    const withdrawAccount = await program.account.withdrawState.fetch(withdrawPda);

    expect(withdrawAccount).to.exist;
    expect(withdrawAccount.authority.toString()).to.equal(user.publicKey.toString());
    expect(withdrawAccount.amount.toNumber()).to.equal(amountToWithdraw);
  });
});
