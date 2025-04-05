import Image from "next/image";
import Link from "next/link";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Gift, Users } from "lucide-react";

interface Streamer {
  _id: string;
  name: string;
  image: string;
  subscribers: number;
  public_address: string;
}

interface StreamerCardProps {
  streamer: Streamer;
}

export function StreamerCard({ streamer }: StreamerCardProps) {
  return (
    <Card className="bg-[#18181D] border border-[#2A2A2E] text-white rounded-2xl overflow-hidden shadow-lg hover:border-[#10B981] transition-colors">
      <CardContent className="p-5 pb-2">
        <div className="flex items-center gap-4">
          <div className="relative h-16 w-16 flex-shrink-0">
            <Image
              src={streamer.image || "/placeholder.svg"}
              alt={streamer.name}
              fill
              className="rounded-full object-cover"
            />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-lg truncate text-white">
                {streamer.name}
              </h3>
            </div>
            <div className="flex items-center mt-1 text-xs text-gray-400">
              <Users className="h-3 w-3 mr-1 text-[#10B981]" />
              <span>{streamer.subscribers.toLocaleString()} subscribers</span>
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between px-5 pb-5 pt-2">
        <Link href={`/streamers/${streamer._id}`}>
          <Button
            size="sm"
            className="bg-[#2A2A2E] hover:bg-[#10B981] text-white hover:text-black border border-[#2A2A2E]"
          >
            View Profile
          </Button>
        </Link>
        <Link href={`/donate/${streamer._id}`}>
          <Button
            size="sm"
            className="bg-[#10B981] hover:bg-[#0D9668] text-black"
          >
            <Gift className="h-4 w-4 mr-2" />
            Donate
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
}
