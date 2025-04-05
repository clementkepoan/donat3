import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Gift, PlusCircle, Wallet, Search } from "lucide-react";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-1">
        <section className="py-12 px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-3xl font-bold mb-6">
              Crypto Donations for Streamers
            </h1>
            <p className="mb-8 text-muted-foreground">
              Support your favorite content creators with direct crypto
              donations
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/donate">
                <Button className="w-full sm:w-auto">
                  <Search className="mr-2 h-4 w-4" />
                  Find Streamers
                </Button>
              </Link>
              <Link href="/profile">
                <Button variant="outline" className="w-full sm:w-auto">
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Setup Profile
                </Button>
              </Link>
            </div>
          </div>
        </section>

        <section className="py-8 px-4 bg-muted">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-xl font-bold mb-6 text-center">Features</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-card p-4 rounded border">
                <div className="flex items-center gap-2 mb-2">
                  <Gift className="h-5 w-5" />
                  <h3 className="font-bold">P2P Donations</h3>
                </div>
                <p className="text-sm text-muted-foreground">
                  Send crypto directly from your wallet to streamers with no
                  platform fees.
                </p>
              </div>
              <div className="bg-card p-4 rounded border">
                <div className="flex items-center gap-2 mb-2">
                  <Search className="h-5 w-5" />
                  <h3 className="font-bold">Streamer Profiles</h3>
                </div>
                <p className="text-sm text-muted-foreground">
                  Discover and support your favorite content creators through
                  searchable profiles.
                </p>
              </div>
              <div className="bg-card p-4 rounded border">
                <div className="flex items-center gap-2 mb-2">
                  <Wallet className="h-5 w-5" />
                  <h3 className="font-bold">Wallet Management</h3>
                </div>
                <p className="text-sm text-muted-foreground">
                  View your wallet balances and NFT collection in one place.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
