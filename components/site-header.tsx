"use client"

import Link from "next/link"
import { WalletConnect } from "@/components/wallet-connect"
import { Button } from "@/components/ui/button"
import { Wallet, Gift, Menu, PlusCircle, Search } from "lucide-react"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { useState } from "react"

export function SiteHeader() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <header className="border-b bg-background">
      <div className="container flex h-14 items-center justify-between">
        <div className="flex items-center gap-2">
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon" aria-label="Menu">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[240px]">
              <nav className="flex flex-col gap-4 mt-8">
                <Link href="/" className="text-lg font-medium" onClick={() => setIsOpen(false)}>
                  Home
                </Link>
                <Link href="/donate" className="text-lg font-medium" onClick={() => setIsOpen(false)}>
                  Find Streamers
                </Link>
                <Link href="/mint" className="text-lg font-medium" onClick={() => setIsOpen(false)}>
                  Mint NFT
                </Link>
                <Link href="/my-wallet" className="text-lg font-medium" onClick={() => setIsOpen(false)}>
                  My Wallet
                </Link>
                <Link href="/overlay" className="text-lg font-medium" onClick={() => setIsOpen(false)}>
                  Stream Overlay
                </Link>
              </nav>
            </SheetContent>
          </Sheet>

          <Link href="/" className="flex items-center gap-2">
            <Gift className="h-5 w-5" />
            <span className="font-bold text-lg hidden sm:inline-block">CryptoDonate</span>
          </Link>
        </div>

        <nav className="hidden md:flex items-center gap-6">
          <Link href="/donate" className="text-sm flex items-center gap-1">
            <Search className="h-4 w-4" />
            Find Streamers
          </Link>
          <Link href="/mint" className="text-sm flex items-center gap-1">
            <PlusCircle className="h-4 w-4" />
            Mint NFT
          </Link>
          <Link href="/my-wallet" className="text-sm flex items-center gap-1">
            <Wallet className="h-4 w-4" />
            My Wallet
          </Link>
          <Link href="/overlay" className="text-sm">
            Stream Overlay
          </Link>
        </nav>

        <WalletConnect />
      </div>
    </header>
  )
}

