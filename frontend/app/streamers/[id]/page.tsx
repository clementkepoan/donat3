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
  ExternalLink,
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
  const [streamer, setStreamer] = useState<Streamer | null>(null); // Initialize as null
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
        console.log("Streamer data:", response, response.ok);
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
      <main className="py-8 bg-gradient-to-b from-background to-slate-50 dark:from-background dark:to-slate-950 min-h-screen">
        <div className="max-w-3xl mx-auto flex justify-center py-12">
          <div className="flex flex-col items-center">
            <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
            <p className="text-muted-foreground animate-pulse">
              Loading streamer profile...
            </p>
          </div>
        </div>
      </main>
    );
  }

  if (error || !streamer) {
    return (
      <main className="py-8 bg-gradient-to-b from-background to-slate-50 dark:from-background dark:to-slate-950 min-h-screen">
        <div className="max-w-3xl mx-auto">
          <div className="mb-4">
            <Link
              href="/donate"
              className="text-sm text-muted-foreground hover:text-foreground flex items-center group transition-colors duration-200"
            >
              <ArrowLeft className="h-4 w-4 mr-1.5 group-hover:-translate-x-0.5 transition-transform" />{" "}
              Back to streamers
            </Link>
          </div>

          <div className="text-center py-12 border rounded-xl bg-card/50 backdrop-blur-sm shadow-md">
            <AlertCircle className="h-16 w-16 mx-auto text-destructive/80 mb-4" />
            <h2 className="text-2xl font-bold mb-2">Streamer Not Found</h2>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              We couldn't find the streamer you're looking for. They may have
              changed their username or deactivated their account.
            </p>
            <Link href="/donate">
              <Button
                size="lg"
                className="px-8 py-6 h-auto rounded-full font-semibold text-base"
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
    <main className="py-8 bg-gradient-to-b from-background to-slate-50 dark:from-background dark:to-slate-950 min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <div className="mb-6">
          <Link
            href="/donate"
            className="text-sm text-muted-foreground hover:text-foreground flex items-center group transition-colors duration-200"
          >
            <ArrowLeft className="h-4 w-4 mr-1.5 group-hover:-translate-x-0.5 transition-transform" />{" "}
            Back to streamers
          </Link>
        </div>

        <div className="border border-border/40 rounded-2xl overflow-hidden mb-8 shadow-lg bg-card/80 backdrop-blur-sm">
          <div className="bg-muted h-48 relative">
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
            <div className="relative h-28 w-28 -mt-14 border-4 border-background rounded-full overflow-hidden shadow-xl">
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
                  <h1 className="text-3xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-primary to-violet-500">
                    {streamer.name}
                  </h1>
                </div>
              </div>

              <div className="flex items-center mt-3 text-sm space-x-6">
                <div className="flex items-center px-3 py-1.5 rounded-full bg-primary/10 text-primary">
                  <Users className="h-4 w-4 mr-1.5" />
                  <span className="font-medium">
                    {streamer.subscribers.toLocaleString()} followers
                  </span>
                </div>
                <div className="flex items-center px-3 py-1.5 rounded-full bg-secondary/10 text-secondary-foreground">
                  <Eye className="h-4 w-4 mr-1.5" />
                  <span className="font-medium">
                    {streamer.viewers} viewers
                  </span>
                </div>
              </div>

              <p className="mt-5 text-lg leading-relaxed text-muted-foreground">
                {streamer.description}
              </p>

              <div className="mt-8 flex flex-col sm:flex-row gap-4">
                <Link href={`/donate/${streamer._id}`}>
                  <Button
                    size="lg"
                    className="gap-2 px-8 py-6 h-auto rounded-xl font-semibold text-base shadow-lg hover:shadow-primary/25 transition-all duration-200"
                  >
                    <Gift className="h-5 w-5" />
                    Support {streamer.name}
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="border border-border/40 rounded-2xl p-6 bg-card/80 backdrop-blur-sm shadow-md">
            <div className="flex items-center space-x-2 mb-4">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="text-primary"
              >
                <path
                  d="M2 12.61L7 17.61M22 12.61L17 17.61M14.5 8.61C14.5 10.26 13.16 11.61 11.5 11.61C9.84 11.61 8.5 10.26 8.5 8.61C8.5 6.95 9.84 5.61 11.5 5.61C13.16 5.61 14.5 6.95 14.5 8.61ZM15.24 20.51C14.24 21.41 12.7 21.41 11.7 20.51C11.32 20.17 10.69 20.17 10.3 20.51C9.3 21.41 7.77 21.41 6.77 20.51C6.08 19.88 6.08 18.79 6.77 18.16L8.88 16.21C10.15 15.02 12.21 15.02 13.48 16.21L15.24 17.9C15.68 18.3 15.68 18.95 15.24 19.35V20.51Z"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <h3 className="text-lg font-bold">About {streamer.name}</h3>
            </div>
            <div className="space-y-3">
              <div className="flex items-center text-sm">
                <span className="text-muted-foreground w-32">Username:</span>
                <span className="font-medium">{streamer.name}</span>
              </div>
              <div className="flex items-center text-sm">
                <span className="text-muted-foreground w-32">Subs Count:</span>
                <span className="font-medium">
                  {streamer.subscribers.toLocaleString()} members
                </span>
              </div>
              <div className="flex items-center text-sm">
                <span className="text-muted-foreground w-32">
                  Viewer Count:
                </span>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400">
                  <span className="w-2 h-2 mr-1.5 rounded-full bg-emerald-500"></span>
                  {streamer.viewers} viewers
                </span>
              </div>
            </div>
          </div>

          <div className="border border-border/40 rounded-2xl p-6 bg-card/80 backdrop-blur-sm shadow-md">
            <div className="flex items-center space-x-2 mb-4">
              <Shield className="h-5 w-5 text-primary" />
              <h3 className="text-lg font-bold">Secure Donations</h3>
            </div>
            <Alert className="border-primary/20 bg-primary/5 mb-4">
              <AlertCircle className="h-4 w-4 text-primary" />
              <AlertDescription>
                When you donate to {streamer.name}, funds are sent directly to
                their wallet with no platform fees.
              </AlertDescription>
            </Alert>
            <div className="flex justify-center">
              <Link href={`/donate/${streamer._id}`}>
                <Button className="gap-2">
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
