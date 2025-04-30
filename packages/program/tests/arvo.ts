import {
  AnchorProvider,
  type Program,
  setProvider,
  workspace,
} from "@coral-xyz/anchor";
import { describe, it } from "mocha";
import type { Arvo } from "../target/types/arvo";

describe("arvo", () => {
  setProvider(AnchorProvider.env());

  const program = workspace.arvo as Program<Arvo>;

  it("Is initialized!", async () => {
    const tx = await program.methods.initialize().rpc();
    console.log("Your transaction signature", tx);
  });
});
