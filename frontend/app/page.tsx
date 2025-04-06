import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Gift, PlusCircle, Wallet, Search } from "lucide-react";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-[#0E0E12] via-[#101014] to-[#0E0E12] text-white">
      <main className="flex-1">
        <section className="py-24 px-6">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl font-extrabold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-purple-500 to-cyan-400">
              Crypto Donations for Streamers
            </h1>
            <p className="mb-10 text-lg text-gray-400">
              Support your favorite content creators with direct crypto
              donations — no middlemen.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/donate">
                <Button className="w-full sm:w-auto px-6 py-4 text-base font-semibold shadow-lg">
                  <Search className="mr-2 h-5 w-5" />
                  Find Streamers
                </Button>
              </Link>
              <Link href="/profile">
                <Button
                  variant="outline"
                  className="w-full sm:w-auto px-6 py-4 text-base font-semibold border-[#2A2A2E] bg-[#121217] text-white hover:bg-[#18181D]"
                >
                  <PlusCircle className="mr-2 h-5 w-5" />
                  Setup Profile
                </Button>
              </Link>
            </div>
          </div>
        </section>

        <section className="py-16 px-6 bg-[#121217] border-t border-[#2A2A2E]">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12 text-white">
              Why Choose <span className="text-white">DONAT</span>
              <span className="text-[#10B981]">3</span> ?
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="rounded-2xl bg-[#18181D] p-6 border border-[#2A2A2E] shadow-lg">
                <div className="flex items-center gap-3 mb-3">
                  <Gift className="h-5 w-5 text-[#10B981]" />
                  <h3 className="text-lg font-semibold">P2P Donations</h3>
                </div>
                <p className="text-sm text-gray-400">
                  Send crypto directly from your wallet to streamers with no
                  platform fees or delays.
                </p>
              </div>
              <div className="rounded-2xl bg-[#18181D] p-6 border border-[#2A2A2E] shadow-lg">
                <div className="flex items-center gap-3 mb-3">
                  <Search className="h-5 w-5 text-[#10B981]" />
                  <h3 className="text-lg font-semibold">Streamer Profiles</h3>
                </div>
                <p className="text-sm text-gray-400">
                  Discover and support your favorite creators via curated,
                  searchable profiles.
                </p>
              </div>
              <div className="rounded-2xl bg-[#18181D] p-6 border border-[#2A2A2E] shadow-lg">
                <div className="flex items-center gap-3 mb-3">
                  <Wallet className="h-5 w-5 text-[#10B981]" />
                  <h3 className="text-lg font-semibold">Wallet Management</h3>
                </div>
                <p className="text-sm text-gray-400">
                  View wallet balances and NFT collections in a sleek, secure
                  interface.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
