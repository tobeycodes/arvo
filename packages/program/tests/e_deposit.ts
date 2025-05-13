import { AnchorProvider, type Program, setProvider, web3, workspace } from "@coral-xyz/anchor";
import {
  getAssociatedTokenAddress,
  getOrCreateAssociatedTokenAccount,
  mintTo,
} from "@solana/spl-token";
import { BN } from "bn.js";
import { expect } from "chai";
import { describe, it } from "mocha";
import type { Arvo } from "../target/types/arvo";
import { mintKeypair, usdcMint, userKeypair } from "./utils";

describe("deposit", () => {
  const provider = AnchorProvider.env();
  setProvider(provider);

  const program = workspace.arvo as Program<Arvo>;
  const connection = provider.connection;

  it("can make a deposit", async () => {
    const user = userKeypair();
    const mint = mintKeypair();

    const airdropTx = await connection.requestAirdrop(user.publicKey, web3.LAMPORTS_PER_SOL * 1);

    const latestBlockHash = await connection.getLatestBlockhash();

    await connection.confirmTransaction({
      blockhash: latestBlockHash.blockhash,
      lastValidBlockHeight: latestBlockHash.lastValidBlockHeight,
      signature: airdropTx,
    });

    const userUsdcAccount = await getOrCreateAssociatedTokenAccount(
      connection,
      user,
      usdcMint,
      user.publicKey,
    );

    const usdcUserOldBalance = await connection.getTokenAccountBalance(userUsdcAccount.address);

    const amountToMint = 100_000_000;

    await mintTo(
      connection,
      provider.wallet.payer as web3.Signer,
      usdcMint,
      userUsdcAccount.address,
      provider.wallet.publicKey,
      amountToMint,
    );

    const [vaultPda] = web3.PublicKey.findProgramAddressSync(
      [Buffer.from("vault")],
      program.programId,
    );

    const usdcAta = await getAssociatedTokenAddress(usdcMint, vaultPda, true);

    const usdcVaultOldBalance = await connection.getTokenAccountBalance(usdcAta);

    await program.methods
      .deposit(new BN(amountToMint))
      .accounts({
        mint: mint.publicKey,
        authority: user.publicKey,
      })
      .signers([user])
      .rpc();

    const usdcUserNewBalance = await connection.getTokenAccountBalance(userUsdcAccount.address);

    const usdcVaultNewBalance = await connection.getTokenAccountBalance(usdcAta);

    expect(usdcUserOldBalance.value.uiAmount).to.equal(usdcUserNewBalance.value.uiAmount);

    expect((usdcVaultOldBalance.value.uiAmount ?? Math.random()) + 100).to.equal(
      usdcVaultNewBalance.value.uiAmount,
    );

    const [depositPda] = web3.PublicKey.findProgramAddressSync(
      [Buffer.from("deposit"), user.publicKey.toBuffer()],
      program.programId,
    );

    const depositAccount = await program.account.depositState.fetch(depositPda);

    expect(depositAccount).to.exist;
    expect(depositAccount.authority.toString()).to.equal(user.publicKey.toString());
    expect(depositAccount.amount.toNumber()).to.equal(amountToMint);
  });
});
