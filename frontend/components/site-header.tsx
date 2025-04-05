"use client";

import Link from "next/link";
import { WalletConnect } from "@/components/wallet-connect";
import { Button } from "@/components/ui/button";
import { Wallet, Menu, PlusCircle, Search } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useState } from "react";

export function SiteHeader() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="border-b bg-[#0F0F13] shadow-md text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex h-16 items-center justify-between">
        <div className="flex items-center gap-3">
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild className="md:hidden">
              <Button
                variant="ghost"
                size="icon"
                aria-label="Menu"
                className="hover:bg-[#1F1F25]"
              >
                <Menu className="h-5 w-5 text-white" />
              </Button>
            </SheetTrigger>
            <SheetContent
              side="left"
              className="w-[280px] bg-[#121217] text-white border-r border-[#2A2A2E]"
            >
              <div className="flex items-center gap-2 mb-8 mt-4">
                <span
                  className="font-extrabold text-3xl"
                  style={{
                    fontFamily: "'Poppins', sans-serif",
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                  }}
                >
                  Donat<span style={{ color: "#10B981" }}>3</span>
                </span>
              </div>
              <nav className="flex flex-col gap-5">
                <Link
                  href="/"
                  className="text-lg font-medium transition-colors hover:text-[#10B981] flex items-center gap-2"
                  onClick={() => setIsOpen(false)}
                  style={{ fontFamily: "'Inter', sans-serif" }}
                >
                  Home
                </Link>
                <Link
                  href="/donate"
                  className="text-lg font-medium transition-colors hover:text-[#10B981] flex items-center gap-2"
                  onClick={() => setIsOpen(false)}
                  style={{ fontFamily: "'Inter', sans-serif" }}
                >
                  <Search className="h-5 w-5" />
                  Find Streamers
                </Link>
                <Link
                  href="/mint"
                  className="text-lg font-medium transition-colors hover:text-[#10B981] flex items-center gap-2"
                  onClick={() => setIsOpen(false)}
                  style={{ fontFamily: "'Inter', sans-serif" }}
                >
                  <PlusCircle className="h-5 w-5" />
                  Mint NFT
                </Link>
                <Link
                  href="/my-wallet"
                  className="text-lg font-medium transition-colors hover:text-[#10B981] flex items-center gap-2"
                  onClick={() => setIsOpen(false)}
                  style={{ fontFamily: "'Inter', sans-serif" }}
                >
                  <Wallet className="h-5 w-5" />
                  My Wallet
                </Link>
                <Link
                  href="/overlay"
                  className="text-lg font-medium transition-colors hover:text-[#10B981] flex items-center gap-2"
                  onClick={() => setIsOpen(false)}
                  style={{ fontFamily: "'Inter', sans-serif" }}
                >
                  Stream Overlay
                </Link>
                xqf
              </nav>
            </SheetContent>
          </Sheet>

          <Link href="/" className="flex items-center gap-2">
            <span
              className="font-extrabold text-3xl hidden sm:inline-block tracking-wide"
              style={{
                fontFamily: "'Poppins', sans-serif",
                letterSpacing: "0.1em",
                textTransform: "uppercase",
              }}
            >
              Donat<span style={{ color: "#10B981" }}>3</span>
            </span>
          </Link>
        </div>

        <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
          <Link
            href="/donate"
            className="flex items-center gap-1.5 hover:text-[#10B981] transition-colors"
            style={{ fontFamily: "'Inter', sans-serif" }}
          >
            <Search className="h-4 w-4" />
            Find Streamers
          </Link>
          <Link
            href="/mint"
            className="flex items-center gap-1.5 hover:text-[#10B981] transition-colors"
            style={{ fontFamily: "'Inter', sans-serif" }}
          >
            <PlusCircle className="h-4 w-4" />
            Mint NFT
          </Link>
          <Link
            href="/my-wallet"
            className="flex items-center gap-1.5 hover:text-[#10B981] transition-colors"
            style={{ fontFamily: "'Inter', sans-serif" }}
          >
            <Wallet className="h-4 w-4" />
            My Wallet
          </Link>
          <Link
            href="/overlay"
            className="hover:text-[#10B981] transition-colors"
            style={{ fontFamily: "'Inter', sans-serif" }}
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
