import Image from "next/image"
import Link from "next/link"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"

interface Campaign {
  id: string
  title: string
  description: string
  creator: string
  goal: string
  raised: string
  image: string
}

interface CampaignCardProps {
  campaign: Campaign
}

export function CampaignCard({ campaign }: CampaignCardProps) {
  // Calculate progress percentage (mock calculation)
  const goalValue = Number.parseFloat(campaign.goal.split(" ")[0])
  const raisedValue = Number.parseFloat(campaign.raised.split(" ")[0])
  const progressPercentage = Math.min(Math.round((raisedValue / goalValue) * 100), 100)

  return (
    <Card className="overflow-hidden">
      <div className="aspect-video relative">
        <Image src={campaign.image || "/placeholder.svg"} alt={campaign.title} fill className="object-cover" />
      </div>
      <CardHeader>
        <div className="flex justify-between items-start gap-2">
          <h3 className="text-lg font-bold line-clamp-1">{campaign.title}</h3>
        </div>
        <p className="text-sm text-muted-foreground line-clamp-2">{campaign.description}</p>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="flex justify-between text-sm">
          <span>Creator: {campaign.creator}</span>
        </div>
        <div className="space-y-1">
          <div className="flex justify-between text-sm">
            <span>Raised: {campaign.raised}</span>
            <span>Goal: {campaign.goal}</span>
          </div>
          <Progress value={progressPercentage} className="h-2" />
        </div>
      </CardContent>
      <CardFooter>
        <Link href={`/campaigns/${campaign.id}`} className="w-full">
          <Button className="w-full">Donate</Button>
        </Link>
      </CardFooter>
    </Card>
  )
}

