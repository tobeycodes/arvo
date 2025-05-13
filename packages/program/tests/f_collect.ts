import { AnchorProvider, type Program, setProvider, web3, workspace } from "@coral-xyz/anchor";
import {
  TOKEN_2022_PROGRAM_ID,
  getAssociatedTokenAddress,
  getOrCreateAssociatedTokenAccount,
} from "@solana/spl-token";
import { expect } from "chai";
import { describe, it } from "mocha";
import type { Arvo } from "../target/types/arvo";
import { mintKeypair, usdcMint, userKeypair } from "./utils";

describe("collect", () => {
  setProvider(AnchorProvider.env());

  const program = workspace.arvo as Program<Arvo>;
  const connection = AnchorProvider.env().connection;

  it("expect instruction error using a non authorized account", async () => {
    const mint = mintKeypair();
    const fakeUser = web3.Keypair.generate();
    const user = userKeypair();
    const custody = web3.Keypair.generate();

    const [depositPda] = web3.PublicKey.findProgramAddressSync(
      [Buffer.from("deposit"), user.publicKey.toBuffer()],
      program.programId,
    );

    const custodyUsdcAccount = await getOrCreateAssociatedTokenAccount(
      connection,
      user,
      usdcMint,
      custody.publicKey,
    );

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
      .collect()
      .accounts({
        authority: fakeUser.publicKey,
        mint: mint.publicKey,
        usdcAccountCustody: custodyUsdcAccount.address,
      })
      .remainingAccounts([
        {
          pubkey: depositPda,
          isWritable: true,
          isSigner: false,
        },
        {
          pubkey: userMintAccount.address,
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
          "Program log: AnchorError thrown in programs/arvo/src/instructions/collect.rs:64. Error Code: Unauthorized. Error Number: 6000. Error Message: You are not authorized to perform this action.",
        );

        return;
      }

      throw error;
    }
  });

  it("collect instruction mints new tokens and sends to deposit authority", async () => {
    const mint = mintKeypair();
    const user = userKeypair();
    const custody = web3.Keypair.generate();

    const [depositPda] = web3.PublicKey.findProgramAddressSync(
      [Buffer.from("deposit"), user.publicKey.toBuffer()],
      program.programId,
    );

    const custodyUsdcAccount = await getOrCreateAssociatedTokenAccount(
      connection,
      user,
      usdcMint,
      custody.publicKey,
    );

    const usdcCustodyOldBalance = await connection.getTokenAccountBalance(
      custodyUsdcAccount.address,
    );

    expect(0).to.equal(usdcCustodyOldBalance.value.uiAmount);

    const [vaultPda] = web3.PublicKey.findProgramAddressSync(
      [Buffer.from("vault")],
      program.programId,
    );

    const usdcAta = await getAssociatedTokenAddress(usdcMint, vaultPda, true);

    const usdcVaultOldBalance = await connection.getTokenAccountBalance(usdcAta);

    expect(100).to.equal(usdcVaultOldBalance.value.uiAmount);

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

    const userMintAccountOldBalance = await connection.getTokenAccountBalance(
      userMintAccount.address,
    );

    expect(0).to.equal(userMintAccountOldBalance.value.uiAmount);

    await program.methods
      .collect()
      .accounts({
        mint: mint.publicKey,
        usdcAccountCustody: custodyUsdcAccount.address,
      })
      .remainingAccounts([
        {
          pubkey: depositPda,
          isWritable: true,
          isSigner: false,
        },
        {
          pubkey: userMintAccount.address,
          isWritable: true,
          isSigner: false,
        },
      ])
      .rpc();

    const usdcCustodyNewBalance = await connection.getTokenAccountBalance(
      custodyUsdcAccount.address,
    );

    const usdcVaultNewBalance = await connection.getTokenAccountBalance(usdcAta);

    const userMintAccountNewBalance = await connection.getTokenAccountBalance(
      userMintAccount.address,
    );

    expect(0).to.equal(usdcVaultNewBalance.value.uiAmount);

    expect(100).to.equal(usdcCustodyNewBalance.value.uiAmount);

    expect(99).to.equal(Math.floor(userMintAccountNewBalance.value.uiAmount ?? 0));
  });
});
