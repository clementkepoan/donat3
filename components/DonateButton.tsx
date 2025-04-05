"use client"

import { useState } from "react"

// Extend the Window interface to include the ethereum property
declare global {
  interface Window {
    ethereum?: any
  }
}
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Gift, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { ethers } from "ethers"

interface DonateButtonProps {
  recipientAddress: string
  recipientName: string
}

export function DonateButton({ recipientAddress, recipientName }: DonateButtonProps) {
  const { toast } = useToast()
  const [amount, setAmount] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [txHash, setTxHash] = useState<string | null>(null)

  const handleDonate = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      toast({
        title: "Invalid amount",
        description: "Please enter a valid donation amount",
        variant: "destructive",
      })
      return
    }

    try {
      setIsLoading(true)
      setTxHash(null)

      // Check for ethereum object
      if (typeof window === "undefined") {
        throw new Error("Browser environment not available")
      }

      if (!window.ethereum) {
        throw new Error("No web3 provider detected. Please install MetaMask or another wallet")
      }

      // Request accounts with explicit error handling
      let accounts: string[] = []
      
      try {
        accounts = await window.ethereum.request({ method: "eth_requestAccounts" })
      } catch (accountError: any) {
        throw new Error(`Failed to access your wallet: ${accountError.message || 'Unknown error'}`)
      }

      if (!accounts || accounts.length === 0) {
        throw new Error("No accounts available. Please unlock your wallet and try again")
      }

      // Using ethers.js v6
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const amountInWei = ethers.parseEther(amount);
      
      // Notify user
      toast({
        title: "Confirm transaction",
        description: "Please confirm the transaction in your wallet",
      })
      
      // Send transaction with ethers.js v6
      const tx = await signer.sendTransaction({
        to: recipientAddress,
        value: amountInWei,
      })
      
      setTxHash(tx.hash)
      
      toast({
        title: "Transaction sent!",
        description: "Your donation is being processed",
      })
      
      const receipt = await tx.wait(1) // Wait for 1 confirmation
      
      toast({
        title: "Donation successful!",
        description: `You've successfully donated ${amount} ETH to ${recipientName}`,
      })
      
      setAmount("")

    } catch (error: any) {
      console.error("Donation error:", error)
      
      // User-friendly error messaging
      if (error.code === 4001 || (error.message && error.message.includes("user rejected"))) {
        toast({
          title: "Transaction rejected",
          description: "You declined the transaction request",
          variant: "destructive",
        })
      } else {
        toast({
          title: "Donation failed",
          description: error.message || "There was an error processing your donation",
          variant: "destructive",
        })
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <Input
          type="number"
          placeholder="Amount in ETH"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          min="0"
          step="0.001"
          disabled={isLoading}
        />
        <Button onClick={handleDonate} disabled={isLoading || !amount}>
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Sending...
            </>
          ) : (
            <>
              <Gift className="h-4 w-4 mr-2" />
              Donate
            </>
          )}
        </Button>
      </div>
      
      {txHash && (
        <div className="text-xs text-muted-foreground mt-2">
          Transaction hash: <a 
            href={`https://etherscan.io/tx/${txHash}`} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-primary hover:underline truncate"
          >
            {txHash}
          </a>
        </div>
      )}
    </div>
  )
}