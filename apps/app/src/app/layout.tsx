import "@arvo/config-tailwind/app.css";
import type { ReactNode } from "react";
import { AppWalletProvider } from "../components/app-wallet-provider";
import { QueryProvider } from "../components/query-provider";
import { Header } from "@arvo/ui/components/header";

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
