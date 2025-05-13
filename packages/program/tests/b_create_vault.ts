import { AnchorProvider, type Program, setProvider, web3, workspace } from "@coral-xyz/anchor";
import { TOKEN_2022_PROGRAM_ID, getAssociatedTokenAddress } from "@solana/spl-token";
import { expect } from "chai";
import { describe, it } from "mocha";
import type { Arvo } from "../target/types/arvo";
import { mintKeypair, usdcMint } from "./utils";

describe("create_vault", () => {
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
      .createVault()
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
          "Program log: AnchorError thrown in programs/arvo/src/instructions/create_vault.rs:63. Error Code: Unauthorized. Error Number: 6000. Error Message: You are not authorized to perform this action.",
        );

        return;
      }

      throw error;
    }
  });

  it("create vault instruction creates the vault, mint ata and usdc ata", async () => {
    const mint = mintKeypair();

    await program.methods
      .createVault()
      .accounts({
        mint: mint.publicKey,
      })
      .rpc();

    const [vaultPda] = web3.PublicKey.findProgramAddressSync(
      [Buffer.from("vault")],
      program.programId,
    );

    const vaultAccount = await connection.getParsedAccountInfo(vaultPda);
    expect(vaultAccount).to.not.be.null;

    const mintAta = await getAssociatedTokenAddress(
      mint.publicKey,
      vaultPda,
      true,
      TOKEN_2022_PROGRAM_ID,
    );

    const mintAtaInfo = await connection.getAccountInfo(mintAta);

    expect(mintAtaInfo).to.not.be.null;

    const usdcAta = await getAssociatedTokenAddress(usdcMint, vaultPda, true);

    const usdcAtaInfo = await connection.getAccountInfo(usdcAta);

    expect(usdcAtaInfo).to.not.be.null;
  });
});
