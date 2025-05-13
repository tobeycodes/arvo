"use client";

import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { useWallet } from "@solana/wallet-adapter-react";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@arvo/ui/components/tabs";
import { useUsdcBalance } from "../hooks/use-usdc-balance";
import { useUser } from "../hooks/use-user";
import {
  AlertCircle,
  Alert,
  AlertDescription,
  AlertTitle,
} from "@arvo/ui/components/alert";
import { useDeposit } from "../hooks/use-deposit";
import { Button } from "@arvo/ui/components/button";

export default function Home() {
  const { publicKey } = useWallet();
  const { data: usdcBalance } = useUsdcBalance();
  const { data: userData, error: userError } = useUser();
  const { mutate } = useDeposit();

  return (
    <div className="container px-4 mx-auto py-10 gap-5 max-w-[400px] flex flex-col items-center">
      {!publicKey ? (
        <>
          <h1 className="text-2xl font-bold text-center">
            Please connect your wallet
          </h1>
          <WalletMultiButton />
        </>
      ) : null}

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
                Your USDC balance is:{" "}
                <span className="font-bold">{usdcBalance} USDC</span>
              </p>
              <Button onClick={() => mutate()}>Deposit</Button>
            </TabsContent>
            <TabsContent value="password">
              Change your password here.
            </TabsContent>
          </Tabs>
        </>
      ) : null}
    </div>
  );
}
