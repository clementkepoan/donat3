"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import { WalletConnect } from "@/components/wallet-connect"
import Link from "next/link"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Loader2 } from "lucide-react"

// Mock campaign data
const mockCampaign = {
  id: "1",
  title: "Gaming Marathon for Charity",
  description:
    "I'm hosting a 24-hour gaming marathon to raise funds for the local children's hospital. All donations will go directly to helping children in need.",
  creator: "0x1234...5678",
  creatorAddress: "0x1234567890123456789012345678901234567890", // Full address for actual transactions
  goal: "2.5 ETH",
  raised: "1.2 ETH",
  endDate: "2023-12-31",
  donators: 24,
  milestones: [
    { description: "New streaming microphone", amount: "0.5" },
    { description: "Charity donation", amount: "1.5" },
    { description: "Stream overlay improvements", amount: "0.5" },
  ],
}

export default function CampaignPage({ params }: { params: { id: string } }) {
  const { toast } = useToast()
  const [donationAmount, setDonationAmount] = useState("")
  const [donationMessage, setDonationMessage] = useState("")
  const [isDonating, setIsDonating] = useState(false)
  const [walletConnected, setWalletConnected] = useState(false)
  const [transactionHash, setTransactionHash] = useState<string | null>(null)

  const handleDonate = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!donationAmount || Number.parseFloat(donationAmount) <= 0) {
      toast({
        title: "Please enter a valid amount",
      })
      return
    }

    if (!walletConnected) {
      toast({
        title: "Please connect your wallet first",
      })
      return
    }

    setIsDonating(true)

    try {
      // Get the Ethereum provider from window.ethereum
      const { ethereum } = window as any

      if (!ethereum) {
        throw new Error("MetaMask is not installed")
      }

      // Get the current account
      const accounts = await ethereum.request({ method: "eth_accounts" })
      if (accounts.length === 0) {
        throw new Error("No account connected")
      }

      const fromAddress = accounts[0]
      const toAddress = mockCampaign.creatorAddress

      // Convert ETH amount to Wei (1 ETH = 10^18 Wei)
      const amountInWei = BigInt(Number.parseFloat(donationAmount) * 1e18)

      // Prepare the transaction
      const transactionParameters = {
        from: fromAddress,
        to: toAddress,
        value: `0x${amountInWei.toString(16)}`, // Convert to hexadecimal
        gas: "0x5208", // 21000 gas (standard transaction)
      }

      // Send the transaction
      const txHash = await ethereum.request({
        method: "eth_sendTransaction",
        params: [transactionParameters],
      })

      setTransactionHash(txHash)

      // In a real app, you would send the donation message and transaction hash to your backend
      // to associate it with the campaign and trigger notifications

      toast({
        title: "Donation successful!",
        description: "Your transaction has been submitted to the blockchain",
      })

      setDonationAmount("")
      setDonationMessage("")
    } catch (error: any) {
      console.error("Donation error:", error)
      toast({
        title: "Donation failed",
        description: error.message || "There was an error processing your donation",
        variant: "destructive",
      })
    } finally {
      setIsDonating(false)
    }
  }

  // Calculate progress percentage
  const goalValue = Number.parseFloat(mockCampaign.goal.split(" ")[0])
  const raisedValue = Number.parseFloat(mockCampaign.raised.split(" ")[0])
  const progressPercentage = Math.min(Math.round((raisedValue / goalValue) * 100), 100)

  return (
    <main className="container py-8">
      <div className="max-w-3xl mx-auto">
        <div className="mb-4">
          <Link href="/campaigns" className="text-sm text-muted-foreground hover:text-foreground">
            ← Back to campaigns
          </Link>
        </div>

        <div className="border rounded p-4 mb-6">
          <h1 className="text-2xl font-bold mb-2">{mockCampaign.title}</h1>
          <p className="text-sm text-muted-foreground mb-4">
            Created by {mockCampaign.creator} • Ends on {mockCampaign.endDate}
          </p>

          <div className="mb-4">
            <div className="flex justify-between text-sm mb-1">
              <span>Raised: {mockCampaign.raised}</span>
              <span>Goal: {mockCampaign.goal}</span>
            </div>
            <div className="w-full bg-muted h-2 rounded-full">
              <div
                className="bg-primary h-2 rounded-full"
                style={{
                  width: `${progressPercentage}%`,
                }}
              ></div>
            </div>
            <div className="flex justify-between text-xs text-muted-foreground mt-1">
              <span>{progressPercentage}% Complete</span>
              <span>{mockCampaign.donators} Donors</span>
            </div>
          </div>

          <p className="mb-6">{mockCampaign.description}</p>

          {mockCampaign.milestones && mockCampaign.milestones.length > 0 && (
            <div className="mb-6">
              <h3 className="font-bold mb-2">Funding Milestones</h3>
              <div className="space-y-2">
                {mockCampaign.milestones.map((milestone, index) => (
                  <div key={index} className="flex justify-between items-center border-b pb-2">
                    <span>{milestone.description}</span>
                    <span className="font-medium">{milestone.amount} ETH</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="border rounded p-4 bg-muted">
            <h2 className="font-bold mb-4">Make a Donation</h2>

            <form onSubmit={handleDonate} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="amount">Amount (ETH)</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  min="0.01"
                  placeholder="0.05"
                  value={donationAmount}
                  onChange={(e) => setDonationAmount(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="message">Message (Optional)</Label>
                <Textarea
                  id="message"
                  placeholder="Add a message to the creator"
                  value={donationMessage}
                  onChange={(e) => setDonationMessage(e.target.value)}
                  rows={2}
                />
              </div>

              <div className="flex justify-center mb-2">
                <WalletConnect onConnected={setWalletConnected} />
              </div>

              <Button type="submit" className="w-full" disabled={isDonating || !walletConnected}>
                {isDonating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  "Donate"
                )}
              </Button>

              {transactionHash && (
                <div className="text-center text-sm text-muted-foreground">
                  <p>Transaction submitted!</p>
                  <a
                    href={`https://etherscan.io/tx/${transactionHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    View on Etherscan
                  </a>
                </div>
              )}

              <div className="text-xs text-muted-foreground bg-background p-3 rounded border mt-2">
                <p className="font-medium mb-1">How it works:</p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Your donation is sent directly to the creator's wallet</li>
                  <li>Transactions are peer-to-peer with no platform fees</li>
                  <li>Standard Ethereum network fees apply</li>
                </ul>
              </div>
            </form>
          </div>
        </div>
      </div>
    </main>
  )
}

