"use client";

import { Alert, AlertCircle, AlertDescription, AlertTitle } from "@arvo/ui/components/alert";
import { Button } from "@arvo/ui/components/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@arvo/ui/components/tabs";
import { useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { useDeposit } from "../hooks/use-deposit";
import { useUsdcBalance } from "../hooks/use-usdc-balance";
import { useUser } from "../hooks/use-user";

export default function Home() {
  const { publicKey } = useWallet();
  const { data: usdcBalance } = useUsdcBalance();
  const { data: userData, error: userError } = useUser();
  const { mutate } = useDeposit();

  return (
    <div className="container mx-auto flex max-w-[400px] flex-col items-center gap-5 px-4 py-10">
      {publicKey ? null : (
        <>
          <h1 className="text-center font-bold text-2xl">Please connect your wallet</h1>
          <WalletMultiButton />
        </>
      )}

      {userData?.isVerified === false || (publicKey && userError) ? (
        <Alert className="bg-red-500 text-white">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>You must complete KYC</AlertTitle>
          <AlertDescription className="text-white">
            Complete KYC before interacting with the app.
          </AlertDescription>
        </Alert>
      ) : null}

      {userData?.isVerified === true ? (
        <>
          <Tabs defaultValue="account" className="w-full">
            <TabsList className="w-full">
              <TabsTrigger value="account">Deposit</TabsTrigger>
              <TabsTrigger value="password">Withdraw</TabsTrigger>
            </TabsList>
            <TabsContent value="account" className="flex flex-col gap-2">
              <p className="text-center">
                Your USDC balance is: <span className="font-bold">{usdcBalance} USDC</span>
              </p>
              <Button onClick={() => mutate()}>Deposit</Button>
            </TabsContent>
            <TabsContent value="password">Change your password here.</TabsContent>
          </Tabs>
        </>
      ) : null}
    </div>
  );
}
