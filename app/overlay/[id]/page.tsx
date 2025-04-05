"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"

interface DonationAlert {
  id: string
  donor: string
  amount: string
  timestamp: number
}

// Mock settings
const mockSettings = {
  alertDuration: 5,
  fontSize: 24,
  fontFamily: "Inter",
  primaryColor: "#7C3AED",
  backgroundColor: "rgba(0, 0, 0, 0.5)",
  showDonorName: true,
  showAmount: true,
  customMessage: "Thanks for your donation!",
}

// Mock function to simulate receiving donations
const mockDonationListener = (callback: (donation: DonationAlert) => void) => {
  // Simulate a donation coming in every 10 seconds
  const interval = setInterval(() => {
    const mockDonation = {
      id: Math.random().toString(36).substring(2, 9),
      donor: `Donor${Math.floor(Math.random() * 1000)}`,
      amount: `${(Math.random() * 0.2).toFixed(3)} ETH`,
      timestamp: Date.now(),
    }

    callback(mockDonation)
  }, 10000)

  return () => clearInterval(interval)
}

export default function OverlayPage() {
  const params = useParams()
  const campaignId = params.id as string

  const [currentAlert, setCurrentAlert] = useState<DonationAlert | null>(null)
  const [settings] = useState(mockSettings)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    console.log(`Loading overlay for campaign: ${campaignId}`)

    // Set up donation listener
    const cleanup = mockDonationListener((donation) => {
      setCurrentAlert(donation)
      setIsVisible(true)

      // Hide the alert after the specified duration
      setTimeout(() => {
        setIsVisible(false)

        // Clear the alert after the fade-out animation
        setTimeout(() => {
          setCurrentAlert(null)
        }, 500)
      }, settings.alertDuration * 1000)
    })

    return cleanup
  }, [campaignId, settings.alertDuration])

  return (
    <div className="w-full h-screen overflow-hidden">
      {currentAlert && (
        <div
          className={`absolute bottom-0 left-0 right-0 p-4 m-4 rounded transition-opacity duration-500 ${
            isVisible ? "opacity-100" : "opacity-0"
          }`}
          style={{
            backgroundColor: settings.backgroundColor,
            color: settings.primaryColor,
            fontFamily: settings.fontFamily,
            fontSize: `${settings.fontSize}px`,
          }}
        >
          <div className="flex flex-col items-center justify-center">
            {settings.showDonorName && <div className="font-bold">{currentAlert.donor}</div>}
            {settings.showAmount && <div>donated {currentAlert.amount}</div>}
            <div className="mt-2">{settings.customMessage}</div>
          </div>
        </div>
      )}
    </div>
  )
}

