"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { WalletConnect } from "@/components/wallet-connect";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Loader2, ExternalLink } from "lucide-react";
import Image from "next/image";

const mockNFTs = [
  {
    id: "1",
    name: "Crypto Streamer #001",
    image: "/placeholder.svg",
    collection: "Crypto Streamers",
    tokenId: "1",
    contractAddress: "0x1234567890123456789012345678901234567890",
  },
  {
    id: "2",
    name: "Donation Badge #42",
    image: "/placeholder.svg",
    collection: "Donation Badges",
    tokenId: "42",
    contractAddress: "0x0987654321098765432109876543210987654321",
  },
];

const mockTokens = [
  {
    symbol: "ETH",
    name: "Ethereum",
    balance: "1.245",
    usdValue: "2,490.00",
    icon: "/placeholder.svg",
  },
  {
    symbol: "USDC",
    name: "USD Coin",
    balance: "150.00",
    usdValue: "150.00",
    icon: "/placeholder.svg",
  },
];

export default function MyWalletPage() {
  const [walletConnected, setWalletConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [nfts, setNfts] = useState(mockNFTs);
  const [initialCheckDone, setInitialCheckDone] = useState(false);

  useEffect(() => {
    const checkWallet = async () => {
      try {
        const { ethereum } = window as any;
        if (ethereum) {
          const accounts = await ethereum.request({ method: "eth_accounts" });
          if (accounts.length > 0) {
            setWalletAddress(accounts[0]);
            setWalletConnected(true);
            await loadWalletData(accounts[0]);
          }
        }
      } catch (error) {
        console.error("Error checking wallet:", error);
      } finally {
        setInitialCheckDone(true);
        setIsLoading(false);
      }
    };

    checkWallet();
  }, []);

  const loadWalletData = useCallback(async (address: string) => {
    setIsLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
    } catch (error) {
      console.error("Error loading wallet data:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleWalletConnected = useCallback(
    async (connected: boolean) => {
      if (connected) {
        setIsLoading(true);
        try {
          const { ethereum } = window as any;
          const accounts = await ethereum.request({ method: "eth_accounts" });
          if (accounts.length > 0) {
            setWalletAddress(accounts[0]);
            setWalletConnected(true);
            await loadWalletData(accounts[0]);
          }
        } catch (error) {
          console.error("Error connecting wallet:", error);
        } finally {
          setIsLoading(false);
        }
      } else {
        setWalletAddress(null);
        setWalletConnected(false);
      }
    },
    [loadWalletData]
  );

  const renderContent = useMemo(() => {
    if (!initialCheckDone || isLoading) {
      return (
        <div className="flex justify-center items-center py-24">
          <Loader2 className="h-10 w-10 animate-spin text-muted-foreground" />
        </div>
      );
    }

    if (!walletConnected) {
      return (
        <div className="text-center py-20">
          <p className="text-muted-foreground text-lg">
            Connect your wallet to get started
          </p>
        </div>
      );
    }

    return (
      <>
        <Card className="mb-6 bg-gradient-to-tr from-gray-900 via-gray-800 to-gray-900 text-white border-none shadow-xl">
          <CardHeader>
            <CardTitle className="text-lg">Connected Wallet</CardTitle>
            <CardDescription className="text-gray-300">
              <div className="flex items-center gap-2 break-all">
                <span>{walletAddress}</span>
                <a
                  href={`https://etherscan.io/address/${walletAddress}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:underline"
                >
                  <ExternalLink className="h-4 w-4" />
                </a>
              </div>
            </CardDescription>
          </CardHeader>
        </Card>

        <Tabs defaultValue="tokens">
          <TabsList className="mb-6 bg-gray-800 p-1 rounded-full shadow-inner w-fit mx-auto">
            <TabsTrigger
              value="tokens"
              className="px-6 py-2 rounded-full text-sm text-white data-[state=active]:bg-white data-[state=active]:text-black"
            >
              Tokens
            </TabsTrigger>
            <TabsTrigger
              value="nfts"
              className="px-6 py-2 rounded-full text-sm text-white data-[state=active]:bg-white data-[state=active]:text-black"
            >
              NFTs
            </TabsTrigger>
          </TabsList>

          <TabsContent value="tokens">
            <div className="grid sm:grid-cols-2 gap-6">
              {mockTokens.map((token) => (
                <Card
                  key={token.symbol}
                  className="bg-gray-900 border-none text-white shadow-md"
                >
                  <CardContent className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 relative">
                        <Image
                          src={token.icon}
                          alt={token.name}
                          fill
                          className="rounded-full"
                        />
                      </div>
                      <div>
                        <p className="font-semibold text-lg">{token.name}</p>
                        <p className="text-sm text-gray-400">{token.symbol}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-semibold">
                        {token.balance} {token.symbol}
                      </p>
                      <p className="text-sm text-gray-400">${token.usdValue}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="nfts">
            <div className="grid sm:grid-cols-2 gap-6">
              {nfts.map((nft) => (
                <Card
                  key={nft.id}
                  className="overflow-hidden bg-gray-900 border-none text-white shadow-md"
                >
                  <div className="relative w-full aspect-square">
                    <Image
                      src={nft.image}
                      alt={nft.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <CardFooter className="flex flex-col items-start p-4 space-y-1">
                    <h3 className="font-semibold text-lg">{nft.name}</h3>
                    <p className="text-sm text-gray-400">{nft.collection}</p>
                    <div className="flex justify-between w-full text-xs text-gray-400 mt-2">
                      <span>Token ID: {nft.tokenId}</span>
                      <a
                        href={`https://etherscan.io/token/${nft.contractAddress}?a=${nft.tokenId}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-400 hover:underline flex items-center gap-1"
                      >
                        View <ExternalLink className="h-3 w-3" />
                      </a>
                    </div>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </>
    );
  }, [initialCheckDone, isLoading, walletConnected, walletAddress, nfts]);

  return (
    <main className="py-12 px-4 sm:px-6 lg:px-8 bg-black min-h-screen font-sans">
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10">
          <h1 className="text-3xl font-bold text-white tracking-tight">
            My Wallet
          </h1>
          <WalletConnect onConnected={handleWalletConnected} />
        </div>
        {renderContent}
      </div>
    </main>
  );
}
