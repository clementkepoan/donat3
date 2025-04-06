"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import {
  Loader2,
  AlertCircle,
  ArrowLeft,
  Users,
  Gift,
  Eye,
  Shield,
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import Link from "next/link";
import Image from "next/image";
import { useParams } from "next/navigation";
import { Streamer } from "@/app/layout";

export default function StreamerProfilePage() {
  const params = useParams();
  const id = params.id as string;

  const { toast } = useToast();
  const [streamer, setStreamer] = useState<Streamer | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function getStreamerData() {
      try {
        setIsLoading(true);
        const response = await fetch(`http://localhost:8000/metadata/get_one`, {
          headers: {
            "Content-Type": "application/json",
          },
          method: "POST",
          body: JSON.stringify({
            id,
          }),
        });

        const data = await response.json();
        if (response.ok && data.streamer) {
          setStreamer({
            _id: data.streamer._id,
            name: data.streamer.name,
            image: data.streamer.image,
            subscribers: data.streamer.subscribers,
            public_address: data.streamer.public_address,
            viewers: data.streamer.viewers,
            description: data.streamer.description,
          });
        } else {
          setError("Streamer not found");
          toast({
            title: "Streamer not found",
            description: "The streamer you're looking for doesn't exist",
            variant: "destructive",
          });
        }
      } catch (err) {
        console.error("Error fetching streamer:", err);
        setError("Failed to load streamer profile");
        toast({
          title: "Streamer not found",
          description: "The streamer you're looking for doesn't exist",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    }

    getStreamerData();
  }, []);

  if (isLoading) {
    return (
      <main className="py-8 bg-gradient-to-br from-[#0E0E12] via-[#101014] to-[#0E0E12] min-h-screen text-white">
        <div className="max-w-3xl mx-auto flex justify-center py-12">
          <div className="flex flex-col items-center">
            <Loader2 className="h-12 w-12 animate-spin text-[#10B981] mb-4" />
            <p className="text-gray-400 animate-pulse">
              Loading streamer profile...
            </p>
          </div>
        </div>
      </main>
    );
  }

  if (error || !streamer) {
    return (
      <main className="py-8 bg-gradient-to-br from-[#0E0E12] via-[#101014] to-[#0E0E12] min-h-screen text-white">
        <div className="max-w-3xl mx-auto">
          <div className="mb-4">
            <Link
              href="/donate"
              className="text-sm text-gray-400 hover:text-white flex items-center group transition-colors duration-200"
            >
              <ArrowLeft className="h-4 w-4 mr-1.5 group-hover:-translate-x-0.5 transition-transform" />{" "}
              Back to streamers
            </Link>
          </div>

          <div className="text-center py-12 border rounded-xl bg-[#18181D] backdrop-blur-sm shadow-md">
            <AlertCircle className="h-16 w-16 mx-auto text-red-500 mb-4" />
            <h2 className="text-2xl font-bold mb-2">Streamer Not Found</h2>
            <p className="text-gray-400 mb-6 max-w-md mx-auto">
              We couldn't find the streamer you're looking for. They may have
              changed their username or deactivated their account.
            </p>
            <Link href="/donate">
              <Button
                size="lg"
                className="px-8 py-6 h-auto rounded-full font-semibold text-base bg-[#10B981] text-white hover:bg-[#0E9E6E]"
              >
                Browse Streamers
              </Button>
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="py-8 bg-gradient-to-br from-[#0E0E12] via-[#101014] to-[#0E0E12] min-h-screen text-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <div className="mb-6">
          <Link
            href="/donate"
            className="text-sm text-gray-400 hover:text-white flex items-center group transition-colors duration-200"
          >
            <ArrowLeft className="h-4 w-4 mr-1.5 group-hover:-translate-x-0.5 transition-transform" />{" "}
            Back to streamers
          </Link>
        </div>

        <div className="border border-[#2A2A2E] rounded-2xl overflow-hidden mb-8 shadow-lg bg-[#18181D]">
          <div className="bg-[#121217] h-48 relative">
            <Image
              src={"/hero.jpg"}
              alt={`${streamer.name}'s banner`}
              fill
              className="object-cover"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          </div>

          <div className="p-8 pt-0 relative">
            <div className="relative h-28 w-28 -mt-14 border-4 border-[#0E0E12] rounded-full overflow-hidden shadow-xl">
              <Image
                src={streamer.image || "/placeholder.svg"}
                alt={streamer.name}
                fill
                className="object-cover"
              />
            </div>

            <div className="mt-5">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-extrabold text-white">
                    {streamer.name}
                  </h1>
                </div>
              </div>

              <div className="flex items-center mt-3 text-sm space-x-6">
                <div className="flex items-center px-3 py-1.5 rounded-full bg-[#10B981]/10 text-[#10B981]">
                  <Users className="h-4 w-4 mr-1.5" />
                  <span className="font-medium">
                    {streamer.subscribers.toLocaleString()} followers
                  </span>
                </div>
                <div className="flex items-center px-3 py-1.5 rounded-full bg-[#3B82F6]/10 text-[#3B82F6]">
                  <Eye className="h-4 w-4 mr-1.5" />
                  <span className="font-medium">
                    {streamer.viewers} viewers
                  </span>
                </div>
              </div>

              <p className="mt-5 text-lg leading-relaxed text-gray-400">
                {streamer.description}
              </p>

              <div className="mt-8 flex flex-col sm:flex-row gap-4">
                <Link href={`/donate/${streamer._id}`}>
                  <Button
                    size="lg"
                    className="gap-2 px-8 py-6 h-auto rounded-xl font-semibold text-base bg-[#10B981] text-white hover:bg-[#0E9E6E] shadow-lg hover:shadow-[#10B981]/25 transition-all duration-200"
                  >
                    <Gift className="h-4 w-4" />
                    Support {streamer.name}
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="border border-[#2A2A2E] rounded-2xl p-6 bg-[#18181D] shadow-md">
            <div className="flex items-center space-x-2 mb-4">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="text-[#10B981]"
              >
                <path
                  d="M2 12.61L7 17.61M22 12.61L17 17.61M14.5 8.61C14.5 10.26 13.16 11.61 11.5 11.61C9.84 11.61 8.5 10.26 8.5 8.61C8.5 6.95 9.84 5.61 11.5 5.61C13.16 5.61 14.5 6.95 14.5 8.61ZM15.24 20.51C14.24 21.41 12.7 21.41 11.7 20.51C11.32 20.17 10.69 20.17 10.3 20.51C9.3 21.41 7.77 21.41 6.77 20.51C6.08 19.88 6.08 18.79 6.77 18.16L8.88 16.21C10.15 15.02 12.21 15.02 13.48 16.21L15.24 17.9C15.68 18.3 15.68 18.95 15.24 19.35V20.51Z"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <h3 className="text-lg font-bold text-white">
                About {streamer.name}
              </h3>
            </div>
            <div className="space-y-3">
              <div className="flex items-center text-sm">
                <span className="text-gray-400 w-32">Username:</span>
                <span className="font-medium text-white">{streamer.name}</span>
              </div>
              <div className="flex items-center text-sm">
                <span className="text-gray-400 w-32">Subs Count:</span>
                <span className="font-medium text-white">
                  {streamer.subscribers.toLocaleString()} members
                </span>
              </div>
              <div className="flex items-center text-sm">
                <span className="text-gray-400 w-32">Viewer Count:</span>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#10B981]/10 text-[#10B981]">
                  <span className="w-2 h-2 mr-1.5 rounded-full bg-[#10B981]"></span>
                  {streamer.viewers} viewers
                </span>
              </div>
            </div>
          </div>

          <div className="border border-[#2A2A2E] rounded-2xl p-6 bg-[#18181D] shadow-md">
            <div className="flex items-center space-x-2 mb-4">
              <Shield className="h-5 w-5 text-[#10B981]" />
              <h3 className="text-lg font-bold text-white">Secure Donations</h3>
            </div>
            <Alert className="border-[#10B981]/20 bg-[#10B981]/5 mb-4">
              <AlertCircle className="h-4 w-4 text-[#10B981]" />
              <AlertDescription className="text-gray-400">
                When you donate to {streamer.name}, funds are sent directly to
                their wallet with no platform fees.
              </AlertDescription>
            </Alert>
            <div className="flex justify-center">
              <Link href={`/donate/${streamer._id}`}>
                <Button className="gap-2 bg-[#10B981] text-white hover:bg-[#0E9E6E]">
                  <Gift className="h-4 w-4" />
                  Support Now
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
