"use client";

import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { useQuery } from "@tanstack/react-query";
import { getAccount, getAssociatedTokenAddress } from "@solana/spl-token";
import { PublicKey } from "@solana/web3.js";

const USDC_MINT = new PublicKey("EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v");

export function useUsdcBalance() {
  const { connection } = useConnection();
  const { publicKey } = useWallet();

  return useQuery({
    queryKey: ["repoData", publicKey?.toString()],
    queryFn: async () => {
      if (!publicKey) {
        throw new Error("Wallet not connected");
      }

      const ata = await getAssociatedTokenAddress(USDC_MINT, publicKey);

      const account = await getAccount(connection, ata);

      return Number(account.amount) / 10 ** 6;
    },
    enabled: publicKey !== null,
  });
}
