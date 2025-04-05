"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { WalletConnect } from "@/components/wallet-connect"
import { Loader2, AlertCircle, ArrowLeft, Users, ExternalLink, Gift } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import Link from "next/link"
import Image from "next/image"
import { useParams } from "next/navigation"

// Mock streamer data
const mockStreamers = [
  {
    id: "1",
    name: "CryptoGamer",
    username: "cryptogamer",
    profileImage: "/placeholder.svg?height=100&width=100",
    category: "Gaming",
    description:
      "Streaming Axie Infinity and other blockchain games. I stream daily and focus on educational content for new players. Join me to learn how to earn while playing!",
    walletAddress: "0x1234567890123456789012345678901234567890",
    followers: 1200,
    socialLinks: {
      twitter: "https://twitter.com/cryptogamer",
      twitch: "https://twitch.tv/cryptogamer",
      youtube: "https://youtube.com/cryptogamer",
    },
  },
  {
    id: "2",
    name: "NFT Artist",
    username: "nftartist",
    profileImage: "/placeholder.svg?height=100&width=100",
    category: "Art",
    description:
      "Creating NFT art live on stream. I specialize in digital art with a focus on animated collectibles. Your support helps me create more free content for the community.",
    walletAddress: "0x2345678901234567890123456789012345678901",
    followers: 850,
    socialLinks: {
      twitter: "https://twitter.com/nftartist",
      instagram: "https://instagram.com/nftartist",
    },
  },
  {
    id: "3",
    name: "Crypto Teacher",
    username: "cryptoteacher",
    profileImage: "/placeholder.svg?height=100&width=100",
    category: "Education",
    description:
      "Teaching blockchain and cryptocurrency concepts. I break down complex topics into easy-to-understand lessons. Perfect for beginners looking to enter the crypto space.",
    walletAddress: "0x3456789012345678901234567890123456789012",
    followers: 3200,
    socialLinks: {
      twitter: "https://twitter.com/cryptoteacher",
      youtube: "https://youtube.com/cryptoteacher",
      discord: "https://discord.gg/cryptoteacher",
    },
  },
  {
    id: "4",
    name: "DeFi Degen",
    username: "defidegen",
    profileImage: "/placeholder.svg?height=100&width=100",
    category: "Finance",
    description:
      "Exploring DeFi protocols and yield farming strategies. I share my real portfolio and strategies. Not financial advice, but educational content on maximizing yields.",
    walletAddress: "0x4567890123456789012345678901234567890123",
    followers: 1800,
    socialLinks: {
      twitter: "https://twitter.com/defidegen",
      telegram: "https://t.me/defidegen",
    },
  },
]

export default function StreamerDonatePage() {
  const params = useParams()
  const username = params.username as string

  const { toast } = useToast()
  const [streamer, setStreamer] = useState<any>(null)
  const [donationAmount, setDonationAmount] = useState("")
  const [donationMessage, setDonationMessage] = useState("")
  const [isDonating, setIsDonating] = useState(false)
  const [walletConnected, setWalletConnected] = useState(false)
  const [transactionHash, setTransactionHash] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // In a real app, this would be an API call to fetch the streamer profile
    const foundStreamer = mockStreamers.find((s) => s.username === username)

    if (foundStreamer) {
      setStreamer(foundStreamer)
    } else {
      toast({
        title: "Streamer not found",
        description: "The streamer you're looking for doesn't exist",
        variant: "destructive",
      })
    }

    setIsLoading(false)
  }, [username, toast])

  const handleDonate = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!donationAmount || Number.parseFloat(donationAmount) <= 0) {
      toast({
        title: "Please enter a valid amount",
      })
      return
    }

    if (!walletConnected) {
      toast({
        title: "Please connect your wallet first",
      })
      return
    }

    setIsDonating(true)

    try {
      // Get the Ethereum provider from window.ethereum
      const { ethereum } = window as any

      if (!ethereum) {
        throw new Error("MetaMask is not installed")
      }

      // Get the current account
      const accounts = await ethereum.request({ method: "eth_accounts" })
      if (accounts.length === 0) {
        throw new Error("No account connected")
      }

      const fromAddress = accounts[0]
      const toAddress = streamer.walletAddress

      // Convert ETH amount to Wei (1 ETH = 10^18 Wei)
      const amountInWei = BigInt(Number.parseFloat(donationAmount) * 1e18)

      // Prepare the transaction
      const transactionParameters = {
        from: fromAddress,
        to: toAddress,
        value: `0x${amountInWei.toString(16)}`, // Convert to hexadecimal
        gas: "0x5208", // 21000 gas (standard transaction)
      }

      // Send the transaction
      const txHash = await ethereum.request({
        method: "eth_sendTransaction",
        params: [transactionParameters],
      })

      setTransactionHash(txHash)

      // In a real app, you would send the donation message and transaction hash to your backend
      // to associate it with the streamer and trigger notifications

      toast({
        title: "Donation successful!",
        description: `You've successfully donated to ${streamer.name}`,
      })

      setDonationAmount("")
      setDonationMessage("")
    } catch (error: any) {
      console.error("Donation error:", error)
      toast({
        title: "Donation failed",
        description: error.message || "There was an error processing your donation",
        variant: "destructive",
      })
    } finally {
      setIsDonating(false)
    }
  }

  if (isLoading) {
    return (
      <main className="container py-8">
        <div className="max-w-3xl mx-auto flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </main>
    )
  }

  if (!streamer) {
    return (
      <main className="container py-8">
        <div className="max-w-3xl mx-auto">
          <div className="mb-4">
            <Link href="/donate" className="text-sm text-muted-foreground hover:text-foreground flex items-center">
              <ArrowLeft className="h-4 w-4 mr-1" /> Back to streamers
            </Link>
          </div>

          <div className="text-center py-12 border rounded-lg">
            <AlertCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-xl font-medium mb-2">Streamer not found</h2>
            <p className="text-muted-foreground mb-4">The streamer you're looking for doesn't exist</p>
            <Link href="/donate">
              <Button>Browse Streamers</Button>
            </Link>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="container py-8">
      <div className="max-w-3xl mx-auto">
        <div className="mb-4">
          <Link href="/donate" className="text-sm text-muted-foreground hover:text-foreground flex items-center">
            <ArrowLeft className="h-4 w-4 mr-1" /> Back to streamers
          </Link>
        </div>

        <div className="border rounded-lg overflow-hidden mb-6">
          <div className="bg-muted h-32 relative">{/* Banner image could go here */}</div>

          <div className="p-6 pt-0 relative">
            <div className="relative h-24 w-24 -mt-12 border-4 border-background rounded-full overflow-hidden">
              <Image
                src={streamer.profileImage || "/placeholder.svg"}
                alt={streamer.name}
                fill
                className="object-cover"
              />
            </div>

            <div className="mt-4">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-bold">{streamer.name}</h1>
                  <p className="text-muted-foreground">@{streamer.username}</p>
                </div>
                <span className="bg-muted px-3 py-1 rounded text-sm">{streamer.category}</span>
              </div>

              <div className="flex items-center mt-2 text-sm text-muted-foreground">
                <Users className="h-4 w-4 mr-1" />
                <span>{streamer.followers.toLocaleString()} followers</span>
              </div>

              <p className="mt-4">{streamer.description}</p>

              {streamer.socialLinks && (
                <div className="mt-4 flex gap-2">
                  {Object.entries(streamer.socialLinks).map(([platform, url]) => (
                    <a
                      key={platform}
                      href={url as string}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-primary hover:underline"
                    >
                      {platform.charAt(0).toUpperCase() + platform.slice(1)}
                    </a>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="border rounded p-4">
          <h2 className="text-xl font-bold mb-4">Support {streamer.name}</h2>

          <form onSubmit={handleDonate} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="amount">Amount (ETH)</Label>
              <Input
                id="amount"
                type="number"
                step="0.001"
                min="0.001"
                placeholder="0.05"
                value={donationAmount}
                onChange={(e) => setDonationAmount(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="message">Message (Optional)</Label>
              <Textarea
                id="message"
                placeholder={`Add a message to ${streamer.name}`}
                value={donationMessage}
                onChange={(e) => setDonationMessage(e.target.value)}
                rows={2}
              />
            </div>

            <div className="flex justify-center mb-2">
              <WalletConnect onConnected={setWalletConnected} />
            </div>

            <Button type="submit" className="w-full" disabled={isDonating || !walletConnected}>
              {isDonating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Gift className="mr-2 h-4 w-4" />
                  Donate to {streamer.name}
                </>
              )}
            </Button>

            {transactionHash && (
              <div className="text-center text-sm">
                <p className="font-medium">Donation successful!</p>
                <a
                  href={`https://etherscan.io/tx/${transactionHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline flex items-center justify-center gap-1"
                >
                  View on Etherscan <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            )}
          </form>
        </div>

        <Alert className="mt-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Donations are sent directly to {streamer.name}'s wallet with no platform fees. Standard network transaction
            fees apply.
          </AlertDescription>
        </Alert>
      </div>
    </main>
  )
}

