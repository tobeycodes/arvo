import "@arvo/config-tailwind/app.css";
import { Header } from "@arvo/ui/components/header";
import type { ReactNode } from "react";
import { AppWalletProvider } from "../components/app-wallet-provider";
import { QueryProvider } from "../components/query-provider";

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
