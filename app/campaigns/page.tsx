import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

// Mock data for campaigns
const mockCampaigns = [
  {
    id: "1",
    title: "Gaming Marathon for Charity",
    description: "24-hour gaming stream to raise funds for children's hospital",
    creator: "0x1234...5678",
    goal: "2.5 ETH",
    raised: "1.2 ETH",
  },
  {
    id: "2",
    title: "New Streaming Setup",
    description: "Help me upgrade my streaming equipment for better content",
    creator: "0xabcd...efgh",
    goal: "1.0 ETH",
    raised: "0.3 ETH",
  },
  {
    id: "3",
    title: "Indie Game Development",
    description: "Supporting my journey to create an indie game",
    creator: "0x9876...5432",
    goal: "5.0 ETH",
    raised: "2.1 ETH",
  },
]

export default function CampaignsPage() {
  return (
    <main className="container py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-4">Browse Campaigns</h1>

        <div className="flex gap-2 mb-6">
          <Input type="search" placeholder="Search campaigns..." className="max-w-sm" />
          <Button>Search</Button>
        </div>

        <div className="space-y-4">
          {mockCampaigns.map((campaign) => (
            <div key={campaign.id} className="border rounded p-4">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-bold">{campaign.title}</h3>
                  <p className="text-sm text-muted-foreground">{campaign.description}</p>
                  <p className="text-sm mt-2">Creator: {campaign.creator}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm">Goal: {campaign.goal}</p>
                  <p className="text-sm">Raised: {campaign.raised}</p>
                  <Link href={`/campaigns/${campaign.id}`}>
                    <Button className="mt-2" size="sm">
                      Donate
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}

