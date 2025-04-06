"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

interface DonationAlert {
  id: string;
  donor: string;
  amount: string;
  timestamp: number;
}

// Mock settings
const mockSettings = {
  alertDuration: 5,
  fontSize: 24,
  fontFamily: "Inter",
  primaryColor: "#7C3AED", // Purple
  accentColor: "#10B981", // Teal
  backgroundColor: "rgba(17, 24, 39, 0.85)", // Dark gray with transparency
  showDonorName: true,
  showAmount: true,
  customMessage: "Thanks for your donation!",
  borderStyle: "gradient", // none, solid, gradient
};

// Mock function to simulate receiving donations
const mockDonationListener = (callback: (donation: DonationAlert) => void) => {
  // Simulate a donation coming in every 10 seconds
  const interval = setInterval(() => {
    const mockDonation = {
      id: Math.random().toString(36).substring(2, 9),
      donor: `eth_donor${Math.floor(Math.random() * 1000)}.eth`,
      amount: `${(Math.random() * 0.2).toFixed(3)} ETH`,
      timestamp: Date.now(),
    };

    callback(mockDonation);
  }, 10000);

  return () => clearInterval(interval);
};

export default function OverlayPage() {
  const params = useParams();
  const campaignId = params.id as string;

  const [currentAlert, setCurrentAlert] = useState<DonationAlert | null>(null);
  const [settings] = useState(mockSettings);
  const [isVisible, setIsVisible] = useState(false);

  const getBorderStyle = () => {
    switch (settings.borderStyle) {
      case "none":
        return {};
      case "solid":
        return { border: `2px solid ${settings.accentColor}` };
      case "gradient":
        return {
          border: "2px solid transparent",
          backgroundClip: "padding-box",
          WebkitBackgroundClip: "padding-box",
          backgroundImage: `linear-gradient(${settings.backgroundColor}, ${settings.backgroundColor}), 
                          linear-gradient(135deg, ${settings.accentColor}, ${settings.primaryColor})`,
        };
      default:
        return {};
    }
  };

  useEffect(() => {
    console.log(`Loading overlay for campaign: ${campaignId}`);

    // Set up donation listener
    const cleanup = mockDonationListener((donation) => {
      setCurrentAlert(donation);
      setIsVisible(true);

      // Hide the alert after the specified duration
      setTimeout(() => {
        setIsVisible(false);

        // Clear the alert after the fade-out animation
        setTimeout(() => {
          setCurrentAlert(null);
        }, 800); // Slightly longer to allow for better animation completion
      }, settings.alertDuration * 1000);
    });

    return cleanup;
  }, [campaignId, settings.alertDuration]);

  return (
    <div className="w-full h-screen overflow-hidden">
      {currentAlert && (
        <div
          className={`absolute bottom-0 left-0 right-0 p-4 m-8 rounded-lg backdrop-blur-sm shadow-2xl transition-all duration-800 ${
            isVisible
              ? "opacity-100 transform translate-y-0"
              : "opacity-0 transform translate-y-10"
          }`}
          style={{
            backgroundColor: settings.backgroundColor,
            color: settings.primaryColor,
            fontFamily: settings.fontFamily,
            fontSize: `${settings.fontSize}px`,
            ...getBorderStyle(),
          }}
        >
          <div className="relative z-10">
            <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 w-16 h-16 flex items-center justify-center rounded-full bg-gray-900/80 border-2 border-gray-700">
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M12 2L19.5 7V17L12 22L4.5 17V7L12 2Z"
                  stroke={settings.accentColor}
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M12 22V16"
                  stroke={settings.accentColor}
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M19.5 7L12 12"
                  stroke={settings.accentColor}
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M4.5 7L12 12"
                  stroke={settings.accentColor}
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          </div>

          <div className="flex flex-col items-center justify-center pt-6">
            {settings.showDonorName && (
              <div className="font-bold text-center">
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-500 to-cyan-500">
                  {currentAlert.donor}
                </span>
              </div>
            )}

            {settings.showAmount && (
              <div className="flex items-center justify-center gap-2 mt-1">
                <span style={{ color: settings.accentColor }}>donated</span>
                <span className="font-mono font-bold">
                  {currentAlert.amount}
                </span>
              </div>
            )}

            <div className="mt-2 opacity-80">{settings.customMessage}</div>

            <div className="w-full mt-3 h-1 bg-gray-800 rounded overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-purple-500 to-cyan-500 rounded transition-all"
                style={{
                  width: "100%",
                  animation: `shrink ${settings.alertDuration}s linear forwards`,
                }}
              ></div>
            </div>
          </div>

          {/* Particle effect background */}
          <div className="absolute inset-0 overflow-hidden rounded-lg">
            <div className="particles-container">
              {Array.from({ length: 10 }).map((_, i) => (
                <div
                  key={i}
                  className="particle absolute w-1 h-1 rounded-full"
                  style={{
                    backgroundColor:
                      i % 2 === 0
                        ? settings.primaryColor
                        : settings.accentColor,
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`,
                    opacity: Math.random() * 0.5 + 0.3,
                    animation: `float ${
                      Math.random() * 5 + 5
                    }s linear infinite`,
                    animationDelay: `${Math.random() * 5}s`,
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes shrink {
          0% {
            width: 100%;
          }
          100% {
            width: 0%;
          }
        }

        @keyframes float {
          0% {
            transform: translateY(0) translateX(0);
          }
          50% {
            transform: translateY(-20px) translateX(10px);
          }
          100% {
            transform: translateY(0) translateX(0);
          }
        }
      `}</style>
    </div>
  );
}
