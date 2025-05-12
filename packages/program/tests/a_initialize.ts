import {
  AnchorProvider,
  Program,
  setProvider,
  web3,
  workspace,
} from "@coral-xyz/anchor";
import { Arvo } from "../target/types/arvo";
import { mintKeypair } from "./utils";
import { expect } from "chai";
import {
  getMint,
  ExtensionType,
  TOKEN_2022_PROGRAM_ID,
  getExtensionTypes,
} from "@solana/spl-token";

const publicKey = "H2S3PxG5jtpJt6MCUyqbrz5TigW5M7zQgkEMmLsyacaT";

describe("initialize", () => {
  setProvider(AnchorProvider.env());

  const program = workspace.arvo as Program<Arvo>;

  const connection = program.provider.connection;

  it("expect instruction error using a non authorized account", async () => {
    const user = web3.Keypair.generate();
    const mint = web3.Keypair.generate();

    const airdropTx = await connection.requestAirdrop(
      user.publicKey,
      web3.LAMPORTS_PER_SOL * 1,
    );

    const latestBlockHash = await connection.getLatestBlockhash();

    await connection.confirmTransaction({
      blockhash: latestBlockHash.blockhash,
      lastValidBlockHeight: latestBlockHash.lastValidBlockHeight,
      signature: airdropTx,
    });

    const tx = await program.methods
      .initialize({
        rate: 32000,
        name: "Arvo",
        symbol: "arvo",
        uri: "https://arvo",
      })
      .accounts({
        authority: user.publicKey,
        mint: mint.publicKey,
      })
      .transaction();

    try {
      await web3.sendAndConfirmTransaction(program.provider.connection, tx, [
        user,
        mint,
      ]);
      expect.fail("Transaction should have failed");
    } catch (error) {
      if (error instanceof web3.SendTransactionError) {
        expect(error.logs).to.include(
          "Program log: AnchorError thrown in programs/arvo/src/instructions/initialize.rs:58. Error Code: Unauthorized. Error Number: 6000. Error Message: You are not authorized to perform this action.",
        );

        return;
      }

      throw error;
    }
  });

  it("create mint with interest bearing 2022 extension", async () => {
    const mint = mintKeypair();
    await program.methods
      .initialize({
        rate: 32000,
        name: "Arvo",
        symbol: "arvo",
        uri: "https://arvo",
      })
      .accounts({
        mint: mint.publicKey,
      })
      .signers([mint])
      .rpc();

    const [adminPda] = web3.PublicKey.findProgramAddressSync(
      [Buffer.from("admin")],
      program.programId,
    );

    const adminAccount = await program.account.admin.fetch(adminPda);

    expect(adminAccount).to.exist;
    expect(adminAccount.authority.toString()).to.equal(publicKey);

    const mintAccount = await getMint(
      connection,
      mint.publicKey,
      "processed",
      TOKEN_2022_PROGRAM_ID,
    );

    expect(mintAccount.decimals).to.equal(6);
    expect(mintAccount.isInitialized).to.equal(true);
    expect(mintAccount.mintAuthority?.toBase58()).to.equal(publicKey);
    expect(mintAccount.freezeAuthority?.toBase58()).to.equal(publicKey);
    expect(mintAccount.supply.toString()).to.equal("0");

    const extensionTypes = getExtensionTypes(mintAccount.tlvData);
    expect(extensionTypes).to.include(ExtensionType.MetadataPointer);
    expect(extensionTypes).to.include(ExtensionType.TokenMetadata);
    expect(extensionTypes).to.include(ExtensionType.InterestBearingConfig);
  });
});
