import Image from "next/image"
import Link from "next/link"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Gift, Users } from "lucide-react"

interface Streamer {
  id: string
  name: string
  username: string
  profileImage: string
  category: string
  description: string
  walletAddress: string
  followers: number
}

interface StreamerCardProps {
  streamer: Streamer
}

export function StreamerCard({ streamer }: StreamerCardProps) {
  return (
    <Card className="overflow-hidden">
      <CardContent className="p-0">
        <div className="flex items-center gap-4 p-4">
          <div className="relative h-16 w-16 flex-shrink-0">
            <Image
              src={streamer.profileImage || "/placeholder.svg"}
              alt={streamer.name}
              fill
              className="rounded-full object-cover"
            />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-lg truncate">{streamer.name}</h3>
              <span className="text-xs bg-muted px-2 py-1 rounded">{streamer.category}</span>
            </div>
            <p className="text-sm text-muted-foreground">@{streamer.username}</p>
            <p className="text-sm line-clamp-2 mt-1">{streamer.description}</p>
            <div className="flex items-center mt-1 text-xs text-muted-foreground">
              <Users className="h-3 w-3 mr-1" />
              <span>{streamer.followers.toLocaleString()} followers</span>
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between p-4 pt-0">
        <Link href={`/streamers/${streamer.username}`}>
          <Button variant="outline" size="sm">
            View Profile
          </Button>
        </Link>
        <Link href={`/donate/${streamer.username}`}>
          <Button size="sm">
            <Gift className="h-4 w-4 mr-2" />
            Donate
          </Button>
        </Link>
      </CardFooter>
    </Card>
  )
}

