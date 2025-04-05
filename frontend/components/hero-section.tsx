import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export function HeroSection() {
  return (
    <section className="bg-gradient-to-b from-background to-muted py-20 md:py-32">
      <div className="px-4 md:px-6">
        <div className="flex flex-col items-center space-y-4 text-center">
          <div className="space-y-2">
            <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl">
              Donate for Streamers
            </h1>
            <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
              Create campaigns, receive crypto donations, and display them on
              your stream with customizable overlays.
            </p>
          </div>
          <div className="space-x-4">
            <Link href="/campaigns/create">
              <Button size="lg" className="gap-2">
                Create Campaign <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/campaigns">
              <Button variant="outline" size="lg">
                Browse Campaigns
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
