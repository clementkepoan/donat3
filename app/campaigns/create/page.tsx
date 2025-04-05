"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { WalletConnect } from "@/components/wallet-connect"
import { X, Plus, Info } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface Milestone {
  description: string
  amount: string
}

export default function CreateCampaignPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    goal: "",
    endDate: "",
  })

  const [milestones, setMilestones] = useState<Milestone[]>([{ description: "Initial goal", amount: "" }])

  const [walletConnected, setWalletConnected] = useState(false)

  const addMilestone = () => {
    setMilestones([...milestones, { description: "", amount: "" }])
  }

  const removeMilestone = (index: number) => {
    const newMilestones = [...milestones]
    newMilestones.splice(index, 1)
    setMilestones(newMilestones)
  }

  const updateMilestone = (index: number, field: "description" | "amount", value: string) => {
    const newMilestones = [...milestones]
    newMilestones[index][field] = value
    setMilestones(newMilestones)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const calculateTotalGoal = () => {
    const validMilestones = milestones.filter((m) => m.amount && !isNaN(Number.parseFloat(m.amount)))
    if (validMilestones.length === 0) return "0.00"

    const total = validMilestones.reduce((sum, milestone) => {
      return sum + Number.parseFloat(milestone.amount || "0")
    }, 0)

    return total.toFixed(2)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // Calculate total goal from milestones
      const totalGoal = calculateTotalGoal()

      // Include milestones in the data that would be sent to the backend
      const campaignData = {
        ...formData,
        goal: totalGoal,
        milestones: milestones.filter((m) => m.description && m.amount),
        transactionType: "direct", // P2P direct transactions
      }

      console.log("Campaign data to submit:", campaignData)

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      toast({
        title: "Campaign created!",
        description: "Your campaign has been created successfully",
      })

      router.push("/campaigns")
    } catch (error) {
      toast({
        title: "Error creating campaign",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Simulate wallet connection status update from WalletConnect component
  const onWalletConnected = (connected: boolean) => {
    setWalletConnected(connected)
  }

  return (
    <main className="container py-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Create a Campaign</h1>

        <div className="border rounded p-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Campaign Title</Label>
              <Input
                id="title"
                name="title"
                placeholder="Enter campaign title"
                value={formData.title}
                onChange={handleChange}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                placeholder="Describe your campaign"
                value={formData.description}
                onChange={handleChange}
                required
                rows={4}
              />
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Label>Funding Milestones</Label>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className="h-4 w-4 text-muted-foreground" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="max-w-xs">
                          Add milestones to show donors how their funds will be used. The total will be your campaign
                          goal.
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <div className="text-sm font-medium">Total Goal: {calculateTotalGoal()} ETH</div>
              </div>

              <div className="space-y-2">
                {milestones.map((milestone, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Input
                      placeholder="Milestone description"
                      value={milestone.description}
                      onChange={(e) => updateMilestone(index, "description", e.target.value)}
                      className="flex-1"
                    />
                    <div className="flex items-center gap-2 w-[180px]">
                      <Input
                        type="number"
                        step="0.01"
                        min="0.01"
                        placeholder="Amount"
                        value={milestone.amount}
                        onChange={(e) => updateMilestone(index, "amount", e.target.value)}
                        className="w-full"
                      />
                      <span className="text-sm">ETH</span>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeMilestone(index)}
                      disabled={milestones.length <= 1}
                    >
                      <X className="h-4 w-4" />
                      <span className="sr-only">Remove</span>
                    </Button>
                  </div>
                ))}
              </div>
              <Button type="button" variant="outline" size="sm" onClick={addMilestone}>
                <Plus className="h-4 w-4 mr-2" />
                Add Milestone
              </Button>
            </div>

            <div className="space-y-2">
              <Label htmlFor="endDate">End Date</Label>
              <Input
                id="endDate"
                name="endDate"
                type="date"
                value={formData.endDate}
                onChange={handleChange}
                required
              />
            </div>

            <div className="bg-muted p-4 rounded">
              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">Connect your wallet</h3>
                    <p className="text-sm text-muted-foreground">Required to receive donations</p>
                  </div>
                  <WalletConnect onConnected={onWalletConnected} />
                </div>

                <div className="text-sm text-muted-foreground bg-background p-3 rounded border">
                  <p className="font-medium mb-1">How donations work:</p>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>Donors will send ETH directly to your connected wallet</li>
                    <li>No smart contracts or platform fees</li>
                    <li>Transactions happen peer-to-peer</li>
                    <li>You'll receive notifications when donations arrive</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" type="button" onClick={() => router.back()}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Creating..." : "Create Campaign"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </main>
  )
}

