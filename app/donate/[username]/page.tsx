"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, AlertCircle, Loader2 } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useToast } from "@/hooks/use-toast"
import { DonateButton } from "@/components/DonateButton"
import Image from "next/image"
import { Button } from "react-day-picker"

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
    walletAddress: "0xBcd4042DE499D14e55001CcbB24a551F3b954096",
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

export default function DonatePage() {
  const params = useParams()
  const username = params.username as string
  const { toast } = useToast()
  
  const [streamer, setStreamer] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // In a real app, this would be an API call to fetch the streamer
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

  if (isLoading) {
    return (
      <main className="container py-8">
        <div className="max-w-md mx-auto flex justify-center py-12">
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
      <div className="max-w-md mx-auto">
        <div className="mb-4">
          <Link 
            href={`/streamers/${streamer.username}`} 
            className="text-sm text-muted-foreground hover:text-foreground flex items-center"
          >
            <ArrowLeft className="h-4 w-4 mr-1" /> Back to {streamer.name}'s profile
          </Link>
        </div>

        <div className="border rounded-lg p-6 mb-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="relative h-12 w-12 rounded-full overflow-hidden">
              <Image
                src={streamer.profileImage || "/placeholder.svg"}
                alt={streamer.name}
                fill
                className="object-cover"
              />
            </div>
            <div>
              <h1 className="text-lg font-medium">Support {streamer.name}</h1>
              <p className="text-sm text-muted-foreground">@{streamer.username}</p>
            </div>
          </div>

          <p className="mb-6 text-sm">{streamer.description}</p>

          <div className="space-y-4">
            <h3 className="font-medium">Send a donation</h3>
            <DonateButton 
              recipientAddress={streamer.walletAddress} 
              recipientName={streamer.name} 
            />
          </div>
        </div>

        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            When you donate to {streamer.name}, funds are sent directly to their wallet with no platform fees.
          </AlertDescription>
        </Alert>
      </div>
    </main>
  )
}

