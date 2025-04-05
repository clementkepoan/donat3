"use client"

import { useState, useEffect } from "react"
import { WalletConnect } from "@/components/wallet-connect"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, ExternalLink } from "lucide-react"
import Image from "next/image"

// Mock NFT data
const mockNFTs = [
  {
    id: "1",
    name: "Crypto Streamer #001",
    image: "/placeholder.svg?height=300&width=300",
    collection: "Crypto Streamers",
    tokenId: "1",
    contractAddress: "0x1234567890123456789012345678901234567890",
  },
  {
    id: "2",
    name: "Donation Badge #42",
    image: "/placeholder.svg?height=300&width=300",
    collection: "Donation Badges",
    tokenId: "42",
    contractAddress: "0x0987654321098765432109876543210987654321",
  },
]

// Mock token data
const mockTokens = [
  {
    symbol: "ETH",
    name: "Ethereum",
    balance: "1.245",
    usdValue: "2,490.00",
    icon: "/placeholder.svg?height=32&width=32",
  },
  {
    symbol: "USDC",
    name: "USD Coin",
    balance: "150.00",
    usdValue: "150.00",
    icon: "/placeholder.svg?height=32&width=32",
  },
]

export default function MyWalletPage() {
  const [walletConnected, setWalletConnected] = useState(false)
  const [walletAddress, setWalletAddress] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [tokens, setTokens] = useState(mockTokens)
  const [nfts, setNfts] = useState(mockNFTs)

  useEffect(() => {
    const checkWallet = async () => {
      const { ethereum } = window as any
      if (ethereum) {
        const accounts = await ethereum.request({ method: "eth_accounts" })
        if (accounts.length > 0) {
          setWalletAddress(accounts[0])
          setWalletConnected(true)
          loadWalletData(accounts[0])
        }
      }
    }

    checkWallet()
  }, [])

  const loadWalletData = async (address: string) => {
    setIsLoading(true)

    try {
      // In a real app, you would:
      // 1. Fetch token balances from an API like Etherscan or Alchemy
      // 2. Fetch NFTs owned by the address
      // 3. Get USD values from a price oracle

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // For the prototype, we'll just use the mock data
      // In a real app, you'd set the actual data from the API responses
    } catch (error) {
      console.error("Error loading wallet data:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleWalletConnected = (connected: boolean) => {
    setWalletConnected(connected)

    if (connected) {
      const { ethereum } = window as any
      ethereum.request({ method: "eth_accounts" }).then((accounts: string[]) => {
        if (accounts.length > 0) {
          setWalletAddress(accounts[0])
          loadWalletData(accounts[0])
        }
      })
    } else {
      setWalletAddress(null)
    }
  }

  const formatAddress = (address: string) => {
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`
  }

  return (
    <main className="container py-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <h1 className="text-2xl font-bold">My Wallet</h1>
          <WalletConnect onConnected={handleWalletConnected} />
        </div>

        {!walletConnected ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground mb-4">Connect your wallet to view your assets</p>
          </div>
        ) : isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
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

            <Tabs defaultValue="tokens">
              <TabsList className="mb-4">
                <TabsTrigger value="tokens">Tokens</TabsTrigger>
                <TabsTrigger value="nfts">NFTs</TabsTrigger>
              </TabsList>

              <TabsContent value="tokens">
                <div className="space-y-4">
                  {tokens.map((token) => (
                    <Card key={token.symbol}>
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
                              <p className="text-sm text-muted-foreground">{token.symbol}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-medium">
                              {token.balance} {token.symbol}
                            </p>
                            <p className="text-sm text-muted-foreground">${token.usdValue}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="nfts">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {nfts.map((nft) => (
                    <Card key={nft.id}>
                      <CardContent className="p-0">
                        <div className="relative w-full aspect-square">
                          <Image
                            src={nft.image || "/placeholder.svg"}
                            alt={nft.name}
                            fill
                            className="object-cover rounded-t-md"
                          />
                        </div>
                      </CardContent>
                      <CardFooter className="flex flex-col items-start p-4">
                        <h3 className="font-medium">{nft.name}</h3>
                        <p className="text-sm text-muted-foreground">{nft.collection}</p>
                        <div className="flex justify-between w-full mt-2">
                          <span className="text-xs text-muted-foreground">Token ID: {nft.tokenId}</span>
                          <a
                            href={`https://etherscan.io/token/${nft.contractAddress}?a=${nft.tokenId}`}
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
        )}
      </div>
    </main>
  )
}

