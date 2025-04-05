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

        if (data.exist) {
          setLinked(true);
        } else {
          setLinked(false);
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
    <div className="p-5 m-auto">
      {isLinked ? (
        <>
          <h1 className="text-2xl font-bold mb-4">YouTube Profile</h1>
          <p className="mb-4">Your YouTube profile is linked.</p>
          <button
            className="bg-red-500 text-white px-4 py-2 rounded"
            onClick={() => {
              // Logic to unlink the profile
              setLinked(false);
            }}
          >
            Unlink Profile
          </button>
        </>
      ) : (
        <>
          <h1 className="text-2xl font-bold mb-4">YouTube Profile</h1>
          <button
            className="bg-blue-500 text-white px-4 py-2 rounded"
            onClick={() => link()}
          />
        </>
      )}
    </div>
  );
}
