"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Search, Users } from "lucide-react";
import { StreamerCard } from "@/components/streamer-card";
import { Streamer } from "@/app/layout";

const limit = 4;

export default function DonatePage() {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [streamers, setStreamers] = useState<Streamer[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch streamers from API
  useEffect(() => {
    const fetchStreamers = async () => {
      setLoading(true); // Set loading true when starting the fetch
      try {
        const response = await fetch("http://localhost:8000/metadata/get", {
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            amount: limit,
            searchQuery: "",
          }),
          method: "POST",
        });

        const result = await response.json();

        if (response.ok) {
          setStreamers(result.streamers || []);
        } else {
          toast({
            title: "Error fetching streamers",
            description: result.message || "Something went wrong.",
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error("Error getting streamers:", error);
        toast({
          title: "Error",
          description: "Could not fetch streamers. Please try again.",
          variant: "destructive",
        });
      } finally {
        setLoading(false); // Set loading false when fetch is complete
      }
    };

    fetchStreamers();
  }, []);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();

    setLoading(true); // Set loading true when starting the search

    try {
      const response = await fetch("http://localhost:8000/metadata/get", {
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount: limit,
          searchQuery,
        }),
        method: "POST",
      });

      const result = await response.json();

      if (response.ok) {
        setStreamers(result.streamers || []);
      } else {
        toast({
          title: "Error searching streamers",
          description: result.message || "Something went wrong.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error getting streamers:", error);
      toast({
        title: "Error",
        description: "Could not search streamers. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false); // Set loading false when search is complete
    }
  };

  return (
    <main className="py-8 bg-gradient-to-br from-[#0E0E12] via-[#101014] to-[#0E0E12] min-h-screen text-white">
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <h1 className="text-2xl font-bold text-white">
            Find a Streamer to Support
          </h1>
          <form onSubmit={handleSearch} className="w-full md:w-auto">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
              <Input
                type="search"
                placeholder="Search streamers..."
                className="pl-8 w-full md:w-[250px] bg-[#18181D] text-white border border-[#2A2A2E] placeholder-gray-400"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </form>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-400">Loading streamers...</p>
          </div>
        ) : streamers.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {streamers.map((streamer) => (
              <StreamerCard
                key={streamer.public_address || streamer.name}
                streamer={streamer}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 border border-[#2A2A2E] rounded-lg bg-[#18181D]">
            <Users className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <h2 className="text-xl font-medium text-white mb-2">
              No streamers found
            </h2>
            <p className="text-gray-400 mb-4">
              Try searching with different keywords
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
