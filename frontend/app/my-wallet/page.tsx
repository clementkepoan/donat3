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

type NFT = {
  title: string;
  tokenId: string;
  contract: string;
  image: string;
};

type Token = {
  name: string;
  symbol: string;
  balance: string;
  decimals: number;
  icon: string;
};

export default function MyWalletPage() {
  const [walletConnected, setWalletConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [initialCheckDone, setInitialCheckDone] = useState(false);

  const [tokens, setTokens] = useState<Token[]>([]);
  const [nfts, setNfts] = useState<NFT[]>([]);

  useEffect(() => {
    const checkWallet = async () => {
      try {
        const { ethereum } = window as any;
        if (ethereum) {
          const accounts = await ethereum.request({ method: "eth_accounts" });
          if (accounts.length > 0) {
            setWalletAddress(accounts[0]);
            setWalletConnected(true);
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

  useEffect(() => {
    const fetchNFTs = async () => {
      if (!walletAddress) return;

      try {
        setIsLoading(true);
        const url = `https://polygon-amoy.g.alchemy.com/nft/v2/${process.env.NEXT_PUBLIC_ALCHEMY_API_KEY}/getNFTsForOwner?owner=${walletAddress}&withMetadata=false`;
        const res = await fetch(url);

        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }

        const data = await res.json();
        if (data?.ownedNfts) {
          const items: NFT[] = data.ownedNfts.map((nft: any) => ({
            title: nft.title || "Untitled",
            tokenId: nft.id.tokenId,
            contract: nft.contract.address,
            image: nft.media?.[0]?.gateway || "",
          }));
          setNfts(items);
        }
        console.log("Fetched NFTs:", data);
      } catch (error: any) {
        console.error("Error fetching NFTs:", error.message);
      } finally {
        setIsLoading(false);
      }
    };

    const fetchTokens = async () => {
      if (!walletAddress) return;

      try {
        setIsLoading(true);
        // Use the correct API endpoint for Alchemy token balances
        const url = `https://polygon-mainnet.g.alchemy.com/v2/${process.env.NEXT_PUBLIC_ALCHEMY_API_KEY}/`;

        const requestOptions = {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            jsonrpc: "2.0",
            id: 1,
            method: "alchemy_getTokenBalances",
            params: [walletAddress, "erc20"],
          }),
        };

        const res = await fetch(url, requestOptions);
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }

        const data = await res.json();
        console.log(data);
        if (data?.result?.tokenBalances) {
          // Fetch metadata for each token
          const tokenBalances = data.result.tokenBalances;
          const tokenDataPromises = tokenBalances.map(async (token: any) => {
            const metadataUrl = `https://polygon-mainnet.g.alchemy.com/v2/${process.env.NEXT_PUBLIC_ALCHEMY_API_KEY}/`;
            const metadataOptions = {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                jsonrpc: "2.0",
                id: 1,
                method: "alchemy_getTokenMetadata",
                params: [token.contractAddress],
              }),
            };

            const metadataRes = await fetch(metadataUrl, metadataOptions);
            const metadata = await metadataRes.json();
            return {
              name: metadata.result.name || "Unknown Token",
              symbol: metadata.result.symbol || "???",
              balance: token.tokenBalance,
              decimals: metadata.result.decimals || 18,
              icon: `https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/${token.contractAddress}/logo.png`,
            };
          });

          const items = await Promise.all(tokenDataPromises);
          console.log("Fetched tokens:", items);
          setTokens(items);
        }
      } catch (error: any) {
        console.error("Error fetching tokens:", error.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchNFTs();
    fetchTokens();
  }, [walletAddress]);

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
        <div className="mb-6">
          <Card>
            <CardHeader>
              <CardTitle>Wallet Address</CardTitle>
              <CardDescription>
                <div className="flex items-center gap-2">
                  <span>{walletAddress}</span>
                  <a
                    href={`https://etherscan.io/address/${walletAddress}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:text-primary/80"
                  >
                    <ExternalLink className="h-4 w-4" />
                    <span className="sr-only">View on Etherscan</span>
                  </a>
                </div>
              </CardDescription>
            </CardHeader>
          </Card>
        </div>

        <Tabs defaultValue="nfts">
          <TabsList className="mb-4">
            <TabsTrigger value="tokens">Tokens</TabsTrigger>
            <TabsTrigger value="nfts">NFTs</TabsTrigger>
          </TabsList>

          <TabsContent value="tokens">
            <div className="space-y-4">
              {tokens.map((token, i) => (
                <Card key={i}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="relative h-8 w-8">
                          <Image
                            src={token.icon || "/placeholder.svg"}
                            alt={token.name}
                            fill
                            className="rounded-full"
                          />
                        </div>
                        <div>
                          <p className="font-medium">{token.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {token.symbol}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">
                          {parseInt(token.balance, 16) /
                            Math.pow(10, token.decimals)}{" "}
                          {token.symbol}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="nfts">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {nfts.map((nft, index) => (
                <Card key={`${nft.contract}-${nft.tokenId}-${index}`}>
                  <CardContent className="p-0">
                    <div className="relative w-full aspect-square">
                      <Image
                        src={nft.image || "/placeholder.svg"}
                        alt={nft.title}
                        fill
                        className="object-cover rounded-t-md"
                      />
                    </div>
                  </CardContent>
                  <CardFooter className="flex flex-col items-start p-4">
                    <h3 className="font-medium">{nft.title}</h3>
                    <p className="text-sm text-muted-foreground">
                      Contract: {nft.contract}
                    </p>
                    <div className="flex justify-between w-full mt-2">
                      <span className="text-xs text-muted-foreground">
                        Token ID: {parseInt(nft.tokenId, 16)}
                      </span>
                      <a
                        href={`https://etherscan.io/token/${
                          nft.contract
                        }?a=${parseInt(nft.tokenId, 16)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-primary hover:underline flex items-center gap-1"
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
          <WalletConnect onConnected={setWalletConnected} />
        </div>
        {renderContent}
      </div>
    </main>
  );
}
