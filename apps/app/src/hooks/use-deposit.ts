import {
  AnchorProvider,
  BN,
  Program,
  setProvider,
  web3,
} from "@coral-xyz/anchor";
import {
  useAnchorWallet,
  useConnection,
  useWallet,
} from "@solana/wallet-adapter-react";
import type { Arvo } from "@arvo/program/types";
import idl from "@arvo/program/idl";
import { useMutation } from "@tanstack/react-query";

export const useDeposit = () => {
  const { connection } = useConnection();
  const { publicKey } = useWallet();
  const wallet = useAnchorWallet();

  const program = new Program(idl as Arvo, {
    connection,
  }) as Program<Arvo>;

  const amountToMint = 100_000_000;

  const mint = new web3.PublicKey(
    "79NJVjqXcz4b4VtdAwBmoJS8JqgS6UiBq4fpCMmVoABi",
  );

  return useMutation({
    mutationKey: ["deposit"],
    mutationFn: async () => {
      if (!publicKey || !wallet) {
        throw new Error("Wallet not connected");
      }

      const provider = new AnchorProvider(connection, wallet, {});
      setProvider(provider);

      const transaction = await program.methods
        .deposit(new BN(amountToMint))
        .accounts({
          mint: mint,
          authority: publicKey,
        })
        .transaction();

      const latestBlockhash = await connection.getLatestBlockhash();

      transaction.recentBlockhash = latestBlockhash.blockhash;
      transaction.feePayer = publicKey;

      return await wallet?.signTransaction(transaction);
    },
  });
};
