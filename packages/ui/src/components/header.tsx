import type { ComponentProps } from "react";
import { cn } from "../lib/utils";
import { Button } from "./button";

function Header({ className, ...props }: ComponentProps<"header">) {
  return (
    <header className={cn(className, "py-6 shadow")} {...props}>
      <div className="container mx-auto flex items-center justify-between">
        <div className="font-bold text-xl uppercase tracking-wide">Arvo</div>

        <Button>Connect Wallet</Button>
      </div>
    </header>
  );
}

export { Header };
