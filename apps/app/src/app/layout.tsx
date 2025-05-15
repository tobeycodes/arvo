import "@arvo/config-tailwind/app.css";
import { Header } from "@arvo/ui/components/header";
import type { Metadata } from "next";
import type { ReactNode } from "react";
import { AppWalletProvider } from "../components/app-wallet-provider";
import { QueryProvider } from "../components/query-provider";

export const metadata: Metadata = {
  title: "Arvo",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body>
        <QueryProvider>
          <AppWalletProvider>
            <Header />
            {children}
          </AppWalletProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
