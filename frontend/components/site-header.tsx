"use client";

import Link from "next/link";
import { WalletConnect } from "@/components/wallet-connect";
import { Button } from "@/components/ui/button";
import { Wallet, Gift, Menu, PlusCircle, Search } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useState } from "react";

export function SiteHeader() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="border-b bg-background shadow-sm">
      <div className="container mx-auto px-4 flex h-16 items-center justify-between">
        <div className="flex items-center gap-3">
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild className="md:hidden">
              <Button
                variant="ghost"
                size="icon"
                aria-label="Menu"
                className="hover:bg-slate-100"
              >
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[280px]">
              <div className="flex items-center gap-2 mb-8 mt-4">
                <Gift className="h-6 w-6 text-primary" />
                <span className="font-bold text-xl">Donat3</span>
              </div>
              <nav className="flex flex-col gap-5">
                <Link
                  href="/"
                  className="text-lg font-medium transition-colors hover:text-primary flex items-center gap-2"
                  onClick={() => setIsOpen(false)}
                >
                  Home
                </Link>
                <Link
                  href="/donate"
                  className="text-lg font-medium transition-colors hover:text-primary flex items-center gap-2"
                  onClick={() => setIsOpen(false)}
                >
                  <Search className="h-5 w-5" />
                  Find Streamers
                </Link>
                <Link
                  href="/mint"
                  className="text-lg font-medium transition-colors hover:text-primary flex items-center gap-2"
                  onClick={() => setIsOpen(false)}
                >
                  <PlusCircle className="h-5 w-5" />
                  Mint NFT
                </Link>
                <Link
                  href="/my-wallet"
                  className="text-lg font-medium transition-colors hover:text-primary flex items-center gap-2"
                  onClick={() => setIsOpen(false)}
                >
                  <Wallet className="h-5 w-5" />
                  My Wallet
                </Link>
                <Link
                  href="/overlay"
                  className="text-lg font-medium transition-colors hover:text-primary flex items-center gap-2"
                  onClick={() => setIsOpen(false)}
                >
                  Stream Overlay
                </Link>
              </nav>
            </SheetContent>
          </Sheet>

          <Link href="/" className="flex items-center gap-2">
            <Gift className="h-6 w-6 text-primary" />
            <span className="font-bold text-xl hidden sm:inline-block">
              Donat3
            </span>
          </Link>
        </div>

        <nav className="hidden md:flex items-center gap-8">
          <Link
            href="/donate"
            className="text-sm font-medium flex items-center gap-1.5 transition-colors hover:text-primary"
          >
            <Search className="h-4 w-4" />
            Find Streamers
          </Link>
          <Link
            href="/mint"
            className="text-sm font-medium flex items-center gap-1.5 transition-colors hover:text-primary"
          >
            <PlusCircle className="h-4 w-4" />
            Mint NFT
          </Link>
          <Link
            href="/my-wallet"
            className="text-sm font-medium flex items-center gap-1.5 transition-colors hover:text-primary"
          >
            <Wallet className="h-4 w-4" />
            My Wallet
          </Link>
          <Link
            href="/overlay"
            className="text-sm font-medium transition-colors hover:text-primary"
          >
            Stream Overlay
          </Link>
        </nav>

        <div className="flex-shrink-0">
          <WalletConnect />
        </div>
      </div>
    </header>
  );
}
