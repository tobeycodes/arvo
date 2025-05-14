import { AnchorProvider, type Program, setProvider, web3, workspace } from "@coral-xyz/anchor";
import { expect } from "chai";
import { describe, it } from "mocha";
import type { Arvo } from "../target/types/arvo";
import { userKeypair } from "./utils";

describe("remove_user", () => {
  const provider = AnchorProvider.env();
  setProvider(provider);

  const program = workspace.arvo as Program<Arvo>;
  const connection = program.provider.connection;

  it("expect instruction error using a non authorized account", async () => {
    const user = userKeypair();
    const fakeUser = web3.Keypair.generate();

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
      .removeUser(user.publicKey)
      .accounts({
        authority: fakeUser.publicKey,
      })
      .transaction();

    try {
      await web3.sendAndConfirmTransaction(program.provider.connection, tx, [fakeUser]);
      expect.fail("Transaction should have failed");
    } catch (error) {
      if (error instanceof web3.SendTransactionError) {
        expect(error.logs).to.include(
          // editorconfig-checker-disable-next-line
          "Program log: AnchorError thrown in programs/arvo/src/instructions/remove_user.rs:29. Error Code: Unauthorized. Error Number: 6000. Error Message: You are not authorized to perform this action.",
        );

        return;
      }

      throw error;
    }
  });

  it("can find user account", async () => {
    const user = userKeypair();

    const [userPda] = web3.PublicKey.findProgramAddressSync(
      [Buffer.from("user"), user.publicKey.toBuffer()],
      program.programId,
    );

    await program.methods.removeUser(user.publicKey).rpc();

    try {
      await program.account.user.fetch(userPda);
      expect.fail("Expected fetch to fail");
    } catch (error) {
      if (error instanceof Error) {
        expect(error.message).to.include("Account does not exist or has no data");

        return;
      }

      throw error;
    }
  });
});
