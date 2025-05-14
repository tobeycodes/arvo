import { AnchorProvider, type Program, setProvider, web3, workspace } from "@coral-xyz/anchor";
import {
  TOKEN_2022_PROGRAM_ID,
  getAssociatedTokenAddress,
  getOrCreateAssociatedTokenAccount,
  mintTo,
} from "@solana/spl-token";
import { expect } from "chai";
import { describe, it } from "mocha";
import type { Arvo } from "../target/types/arvo";
import { mintKeypair, usdcMint, userKeypair } from "./utils";

describe("redeem", () => {
  const provider = AnchorProvider.env();
  setProvider(provider);

  const program = workspace.arvo as Program<Arvo>;
  const connection = AnchorProvider.env().connection;

  it("expect instruction error using a non authorized account", async () => {
    const mint = mintKeypair();
    const fakeUser = web3.Keypair.generate();
    const user = userKeypair();

    const [withdrawPda] = web3.PublicKey.findProgramAddressSync(
      [Buffer.from("withdraw"), user.publicKey.toBuffer()],
      program.programId,
    );

    const userUsdcAccount = await getOrCreateAssociatedTokenAccount(
      connection,
      user,
      usdcMint,
      user.publicKey,
    );

    const airdropTx = await connection.requestAirdrop(
      fakeUser.publicKey,
      web3.LAMPORTS_PER_SOL * 1,
    );

    const latestBlockHash = await connection.getLatestBlockhash();

    await connection.confirmTransaction({
      blockhash: latestBlockHash.blockhash,
      lastValidBlockHeight: latestBlockHash.lastValidBlockHeight,
      signature: airdropTx,
    });

    const tx = await program.methods
      .redeem()
      .accounts({
        authority: fakeUser.publicKey,
        mint: mint.publicKey,
      })
      .remainingAccounts([
        {
          pubkey: withdrawPda,
          isWritable: true,
          isSigner: false,
        },
        {
          pubkey: userUsdcAccount.address,
          isWritable: true,
          isSigner: false,
        },
      ])
      .transaction();

    try {
      await web3.sendAndConfirmTransaction(program.provider.connection, tx, [fakeUser]);
      expect.fail("Transaction should have failed");
    } catch (error) {
      if (error instanceof web3.SendTransactionError) {
        expect(error.logs).to.include(
          // editorconfig-checker-disable-next-line
          "Program log: AnchorError thrown in programs/arvo/src/instructions/redeem.rs:69. Error Code: Unauthorized. Error Number: 6000. Error Message: You are not authorized to perform this action.",
        );

        return;
      }

      throw error;
    }
  });

  it("redeem instruction returns usdc from vault and burns mint", async () => {
    const mint = mintKeypair();
    const user = userKeypair();

    const [withdrawPda] = web3.PublicKey.findProgramAddressSync(
      [Buffer.from("withdraw"), user.publicKey.toBuffer()],
      program.programId,
    );

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
    const mintVaultOldBalance = await connection.getTokenAccountBalance(mintAta);
    expect(50).to.equal(Math.floor(mintVaultOldBalance.value.uiAmount ?? 0));

    const amountToMint = 100_000_000;

    const usdcAta = await getAssociatedTokenAddress(usdcMint, vaultPda, true);

    await mintTo(
      connection,
      provider.wallet.payer as web3.Signer,
      usdcMint,
      usdcAta,
      provider.wallet.publicKey,
      amountToMint,
    );

    const usdcVaultOldBalance = await connection.getTokenAccountBalance(usdcAta);

    expect(100).to.equal(usdcVaultOldBalance.value.uiAmount);

    const userUsdcAccount = await getAssociatedTokenAddress(usdcMint, user.publicKey);

    const userUsdcAccountOldBalance = await connection.getTokenAccountBalance(userUsdcAccount);

    expect(0).to.equal(userUsdcAccountOldBalance.value.uiAmount);

    await program.methods
      .redeem()
      .accounts({
        mint: mint.publicKey,
      })
      .remainingAccounts([
        {
          pubkey: withdrawPda,
          isWritable: true,
          isSigner: false,
        },
        {
          pubkey: userUsdcAccount,
          isWritable: true,
          isSigner: false,
        },
      ])
      .rpc();

    const mintVaultNewBalance = await connection.getTokenAccountBalance(mintAta);
    expect(0).to.equal(mintVaultNewBalance.value.uiAmount);

    const usdcVaultNewBalance = await connection.getTokenAccountBalance(usdcAta);
    expect(49).to.equal(Math.floor(usdcVaultNewBalance.value.uiAmount ?? 0));

    const userUsdcAccountNewBalance = await connection.getTokenAccountBalance(userUsdcAccount);
    expect(50).to.equal(Math.floor(userUsdcAccountNewBalance.value.uiAmount ?? 0));
  });
});
