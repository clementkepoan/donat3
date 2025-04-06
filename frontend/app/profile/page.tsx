"use client";

import { useGoogleLogin } from "@react-oauth/google";
import { useEffect, useState } from "react";

export default function Profile() {
  const [isLinked, setLinked] = useState(false);

  useEffect(() => {
    const checkLinkStatus = async () => {
      try {
        const accounts = await window.ethereum.request({
          method: "eth_requestAccounts",
        });

        let account;
        if (accounts.length > 0) {
          account = accounts[0];
        }

        const res = await fetch("http://localhost:8000/metadata/check", {
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            public_address: account,
          }),
          method: "POST",
        });

        const data = await res.json();

        if (res.ok) {
          if (data.exist) {
            setLinked(true);
          } else {
            setLinked(false);
          }
        } else {
          console.error("Error checking link status:", data.message);
        }
      } catch (error) {
        console.error("Error checking link status:", error);
      }
    };

    checkLinkStatus();
  }, []);

  const link = useGoogleLogin({
    flow: "implicit",
    scope: "https://www.googleapis.com/auth/youtube.readonly",
    onSuccess: async (tokenResponse) => {
      console.log("Access Token:", tokenResponse.access_token);

      // Example API call to YouTube
      const res = await fetch(
        "https://www.googleapis.com/youtube/v3/channels?part=snippet,statistics,brandingSettings&mine=true",
        {
          headers: {
            Authorization: `Bearer ${tokenResponse.access_token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const data = await res.json();
      console.log("YouTube Data:", data);

      const id = data.items[0].id;
      const name = data.items[0].snippet.title;
      const subscribers = data.items[0].statistics.subscriberCount;
      const image = data.items[0].snippet.thumbnails.default.url;
      const description = data.items[0].snippet.description;
      const viewers = data.items[0].statistics.viewCount;

      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });

      let account;
      if (accounts.length > 0) {
        account = accounts[0];
      }

      const response = await fetch("http://localhost:8000/metadata/add", {
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          public_address: account,
          id,
          name,
          subscribers,
          image,
          description,
          viewers,
        }),
        method: "POST",
      });

      const result = await response.json();
      console.log("Profile linked:", result);

      if (result) {
        setLinked(true);
      } else {
        console.error("Failed to link profile");
      }
    },
    onError: () => {
      console.error("Google Login failed");
    },
  });

  return (
    <div className="min-h-screen bg-black text-white p-8 flex flex-col items-center justify-center">
      <div className="w-full max-w-md p-8 border border-zinc-800 rounded-lg bg-zinc-900 backdrop-blur-sm shadow-xl relative">
        {/* X Button in the top right corner */}
        <button
          onClick={() => (window.location.href = "/")}
          className="absolute top-4 right-4 p-1 rounded-full hover:bg-zinc-700 transition-colors"
          aria-label="Close"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 text-zinc-400 hover:text-white"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>

        {isLinked ? (
          <div className="space-y-6">
            <div className="border-b border-zinc-800 pb-4">
              <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-white to-zinc-400 bg-clip-text text-transparent">
                Channel Linked
              </h1>
              <p className="text-zinc-400 mt-2 font-mono text-sm">
                YouTube profile successfully connected to your wallet
              </p>
            </div>

            <div className="flex items-center space-x-2 py-2">
              <div className="h-3 w-3 bg-green-500 rounded-full animate-pulse"></div>
              <p className="text-zinc-300">Active connection established</p>
            </div>

            {/* Removed the disconnect button as requested */}
          </div>
        ) : (
          <div className="space-y-6">
            <div className="border-b border-zinc-800 pb-4">
              <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-white to-zinc-400 bg-clip-text text-transparent">
                Connect YouTube
              </h1>
              <p className="text-zinc-400 mt-2 font-mono text-sm">
                Link your channel to start receiving Web3 donations
              </p>
            </div>

            <div className="bg-zinc-800/50 p-4 rounded-md border border-zinc-700">
              <p className="text-xs text-zinc-400 mb-2 font-mono">
                This will connect your YouTube channel to your wallet address
              </p>
              <div className="flex items-center space-x-2">
                <div className="h-2 w-2 bg-zinc-500 rounded-full"></div>
                <p className="text-zinc-300 text-sm">
                  Access only to your basic channel info
                </p>
              </div>
            </div>

            <button
              onClick={() => link()}
              className="w-full mt-6 py-3 px-4 rounded-md bg-white text-black hover:bg-zinc-200 transition-all duration-300 font-medium flex items-center justify-center group"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 mr-2 text-red-600"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z" />
              </svg>
              <span className="font-medium">Connect with YouTube</span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform duration-300"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 7l5 5m0 0l-5 5m5-5H6"
                />
              </svg>
            </button>
          </div>
        )}

        <div className="mt-8 pt-4 border-t border-zinc-800 text-center">
          <p className="text-xs text-zinc-500 font-mono">
            Secure Web3 connection • {new Date().getFullYear()}
          </p>
        </div>
      </div>
    </div>
  );
}
