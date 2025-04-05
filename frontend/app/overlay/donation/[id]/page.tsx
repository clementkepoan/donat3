"use client";

import DonationAlert from "@/components/donation-alert";
import { useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";
import { useOverlay } from "@/hooks/overlayContext";

interface DonationAlert {
  name: string;
  donation: string;
}

export default function OverlayPage() {
  const [donation, setDonation] = useState<DonationAlert | null>();

  const {
    accentColor,
    backgroundColor,
    borderStyle,
    customMessage,
    fontFamily,
    fontSize,
    primaryColor,
    showAmount,
    showDonorName,
  } = useOverlay();

  useEffect(() => {
    // Create a WebSocket connection to the server (change the URL if needed)
    const socket: Socket = io("http://localhost:8000");

    // Listen for "donation" event from the server
    socket.on("donation", (data: DonationAlert) => {
      console.log("Received donation:", data);
      setDonation(data);

      setTimeout(() => setDonation(null), 7 * 1000); // Hide the alert after the specified duration
    });

    // Clean up the connection when the component is unmounted
    return () => {
      socket.disconnect();
    };
  }, []);

  return (
    <DonationAlert
      accentColor={accentColor!}
      backgroundColor={backgroundColor!}
      borderStyle={borderStyle!}
      customMessage={customMessage!}
      fontFamily={fontFamily!}
      fontSize={fontSize!}
      primaryColor={primaryColor!}
      showAmount={showAmount!}
      showDonorName={showDonorName!}
      donation={donation ? Number(donation.donation) : 0}
      name={donation?.name}
    ></DonationAlert>
  );
}
