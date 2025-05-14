import idl from "@arvo/program/idl";
import type { Arvo } from "@arvo/program/types";
import { AnchorProvider, BN, Program, setProvider, web3 } from "@coral-xyz/anchor";
import { useAnchorWallet, useConnection, useWallet } from "@solana/wallet-adapter-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export const useDeposit = () => {
  const queryClient = useQueryClient();
  const { connection } = useConnection();
  const { publicKey } = useWallet();
  const wallet = useAnchorWallet();

  const program = new Program(idl as Arvo, {
    connection,
  }) as Program<Arvo>;

  const amountToMint = 1_000_000;

  const mint = new web3.PublicKey("G8rqkQXvS9jisjsvKdjwFynyBRqjJPMouRQrnYrNtmPP");

  return useMutation({
    mutationKey: ["deposit"],
    mutationFn: async () => {
      if (!(publicKey && wallet)) {
        throw new Error("Wallet not connected");
      }

      const provider = new AnchorProvider(connection, wallet, {});
      setProvider(provider);

      const transaction = await program.methods
        .deposit(new BN(amountToMint))
        .accounts({
          mint: mint,
          authority: publicKey,
          // @ts-expect-error -- for some reason this is needed on devnet
          usdcMint: new web3.PublicKey("4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU"),
        })
        .transaction();

      return await provider.sendAndConfirm(transaction, [], {
        skipPreflight: false,
        commitment: "confirmed",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["usdcBalance", publicKey?.toString()] });
    },
  });
};
