import { AnchorProvider, type Program, setProvider, web3, workspace } from "@coral-xyz/anchor";
import { expect } from "chai";
import { describe, it } from "mocha";
import type { Arvo } from "../target/types/arvo";
import { userKeypair } from "./utils";

describe("add_user", () => {
  const provider = AnchorProvider.env();
  setProvider(provider);

  const program = workspace.arvo as Program<Arvo>;
  const connection = program.provider.connection;

  it("expect instruction error using a non authorized account", async () => {
    const user = web3.Keypair.generate();

    const airdropTx = await connection.requestAirdrop(user.publicKey, web3.LAMPORTS_PER_SOL * 1);

    const latestBlockHash = await connection.getLatestBlockhash();

    await connection.confirmTransaction({
      blockhash: latestBlockHash.blockhash,
      lastValidBlockHeight: latestBlockHash.lastValidBlockHeight,
      signature: airdropTx,
    });

    const tx = await program.methods
      .addUser(user.publicKey)
      .accounts({
        authority: user.publicKey,
      })
      .transaction();

    try {
      await web3.sendAndConfirmTransaction(program.provider.connection, tx, [user]);
      expect.fail("Transaction should have failed");
    } catch (error) {
      if (error instanceof web3.SendTransactionError) {
        expect(error.logs).to.include(
          // editorconfig-checker-disable-next-line
          "Program log: AnchorError thrown in programs/arvo/src/instructions/add_user.rs:30. Error Code: Unauthorized. Error Number: 6000. Error Message: You are not authorized to perform this action.",
        );

        return;
      }

      throw error;
    }
  });

  it("cannot find user account", async () => {
    const user = userKeypair();

    const [userPda] = web3.PublicKey.findProgramAddressSync(
      [Buffer.from("user"), user.publicKey.toBuffer()],
      program.programId,
    );

    try {
      await program.account.user.fetch(userPda);
      expect.fail("Expected error not thrown");
    } catch (error) {
      expect(error).to.be.instanceOf(Error);
      expect((error as Error).message).to.include("Account does not exist or has no data");
    }
  });

  it("can find user account", async () => {
    const user = userKeypair();

    const [userPda] = web3.PublicKey.findProgramAddressSync(
      [Buffer.from("user"), user.publicKey.toBuffer()],
      program.programId,
    );

    await program.methods.addUser(user.publicKey).rpc();

    const fetchedUser = await program.account.user.fetch(userPda);
    expect(fetchedUser).to.exist;
    expect(fetchedUser.user.toBase58()).to.equal(user.publicKey.toBase58());
    expect(fetchedUser.isVerified).to.equal(true);
  });
});
