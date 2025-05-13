import idl from "@arvo/program/idl";
import type { Arvo } from "@arvo/program/types";
import { AnchorProvider, Program, setProvider, web3 } from "@coral-xyz/anchor";
import { useAnchorWallet, useConnection, useWallet } from "@solana/wallet-adapter-react";
import { useQuery } from "@tanstack/react-query";

export const useUser = () => {
  const { connection } = useConnection();
  const { publicKey } = useWallet();
  const wallet = useAnchorWallet();

  const program = new Program(idl as Arvo, {
    connection,
  }) as Program<Arvo>;

  return useQuery({
    queryKey: ["user", publicKey?.toString()],
    queryFn: async () => {
      if (!(publicKey && wallet)) {
        throw new Error("Wallet not connected");
      }

      const provider = new AnchorProvider(connection, wallet, {});
      setProvider(provider);

      const [userPda] = web3.PublicKey.findProgramAddressSync(
        [Buffer.from("user"), publicKey.toBuffer()],
        program.programId,
      );

      return await program.account.user.fetch(userPda);
    },
    enabled: !!publicKey,
    retry: 0,
  });
};
