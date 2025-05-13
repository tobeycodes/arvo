import { AnchorProvider, type Program, setProvider, web3, workspace } from "@coral-xyz/anchor";
import { ExtensionType, TOKEN_2022_PROGRAM_ID, getExtensionData, getMint } from "@solana/spl-token";
import { expect } from "chai";
import { describe, it } from "mocha";
import type { Arvo } from "../target/types/arvo";
import { mintKeypair } from "./utils";

describe("update_rate", () => {
  setProvider(AnchorProvider.env());

  const program = workspace.arvo as Program<Arvo>;
  const connection = program.provider.connection;

  it("expect instruction error using a non authorized account", async () => {
    const user = web3.Keypair.generate();
    const mint = mintKeypair();

    const airdropTx = await connection.requestAirdrop(user.publicKey, web3.LAMPORTS_PER_SOL * 1);

    const latestBlockHash = await connection.getLatestBlockhash();

    await connection.confirmTransaction({
      blockhash: latestBlockHash.blockhash,
      lastValidBlockHeight: latestBlockHash.lastValidBlockHeight,
      signature: airdropTx,
    });

    const tx = await program.methods
      .updateRate(16000)
      .accounts({
        authority: user.publicKey,
        mint: mint.publicKey,
      })
      .transaction();

    try {
      await web3.sendAndConfirmTransaction(program.provider.connection, tx, [user]);
      expect.fail("Transaction should have failed");
    } catch (error) {
      if (error instanceof web3.SendTransactionError) {
        expect(error.logs).to.include(
          // editorconfig-checker-disable-next-line
          "Program log: AnchorError thrown in programs/arvo/src/instructions/update_rate.rs:28. Error Code: Unauthorized. Error Number: 6000. Error Message: You are not authorized to perform this action.",
        );

        return;
      }

      throw error;
    }
  });

  it("successfully update the rate on the interest rate bearing config", async () => {
    const mint = mintKeypair();

    const oldMintAccount = await getMint(
      connection,
      mint.publicKey,
      "processed",
      TOKEN_2022_PROGRAM_ID,
    );

    const oldMintData = getExtensionData(
      ExtensionType.InterestBearingConfig,
      oldMintAccount.tlvData,
    );

    await program.methods.updateRate(16000).accounts({ mint: mint.publicKey }).rpc();

    const newMintAccount = await getMint(
      connection,
      mint.publicKey,
      "processed",
      TOKEN_2022_PROGRAM_ID,
    );

    const newMintData = getExtensionData(
      ExtensionType.InterestBearingConfig,
      newMintAccount.tlvData,
    );

    expect(oldMintData?.toString("hex")).to.not.equal(newMintData?.toString("hex"));
  });
});
