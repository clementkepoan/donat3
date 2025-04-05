"use client"

import type React from "react"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import { Search, Users } from "lucide-react"
import { StreamerCard } from "@/components/streamer-card"

// Mock streamer data
const mockStreamers = [
  {
    id: "1",
    name: "CryptoGamer",
    username: "cryptogamer",
    profileImage: "/placeholder.svg?height=100&width=100",
    category: "Gaming",
    description: "Streaming Axie Infinity and other blockchain games",
    walletAddress: "0x1234567890123456789012345678901234567890",
    followers: 1200,
  },
  {
    id: "2",
    name: "NFT Artist",
    username: "nftartist",
    profileImage: "/placeholder.svg?height=100&width=100",
    category: "Art",
    description: "Creating NFT art live on stream",
    walletAddress: "0x2345678901234567890123456789012345678901",
    followers: 850,
  },
  {
    id: "3",
    name: "Crypto Teacher",
    username: "cryptoteacher",
    profileImage: "/placeholder.svg?height=100&width=100",
    category: "Education",
    description: "Teaching blockchain and cryptocurrency concepts",
    walletAddress: "0x3456789012345678901234567890123456789012",
    followers: 3200,
  },
  {
    id: "4",
    name: "DeFi Degen",
    username: "defidegen",
    profileImage: "/placeholder.svg?height=100&width=100",
    category: "Finance",
    description: "Exploring DeFi protocols and yield farming strategies",
    walletAddress: "0x4567890123456789012345678901234567890123",
    followers: 1800,
  },
]

export default function DonatePage() {
  const { toast } = useToast()
  const [searchQuery, setSearchQuery] = useState("")
  const [filteredStreamers, setFilteredStreamers] = useState(mockStreamers)

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()

    if (!searchQuery.trim()) {
      setFilteredStreamers(mockStreamers)
      return
    }

    const query = searchQuery.toLowerCase()
    const results = mockStreamers.filter(
      (streamer) =>
        streamer.name.toLowerCase().includes(query) ||
        streamer.username.toLowerCase().includes(query) ||
        streamer.category.toLowerCase().includes(query) ||
        streamer.description.toLowerCase().includes(query),
    )

    setFilteredStreamers(results)

    if (results.length === 0) {
      toast({
        title: "No streamers found",
        description: "Try a different search term",
      })
    }
  }

  return (
    <main className="container py-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <h1 className="text-2xl font-bold">Find a Streamer to Support</h1>
          <form onSubmit={handleSearch} className="w-full md:w-auto">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search streamers..."
                className="pl-8 w-full md:w-[250px]"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </form>
        </div>

        {filteredStreamers.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredStreamers.map((streamer) => (
              <StreamerCard key={streamer.id} streamer={streamer} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 border rounded-lg">
            <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-xl font-medium mb-2">No streamers found</h2>
            <p className="text-muted-foreground mb-4">Try searching with different keywords</p>
          </div>
        )}
      </div>
    </main>
  )
}

