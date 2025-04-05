"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/hooks/use-toast"
import { Copy } from "lucide-react"

export default function OverlayPage() {
  const { toast } = useToast()
  const [overlaySettings, setOverlaySettings] = useState({
    campaignId: "",
    alertDuration: 5,
    fontSize: 24,
    fontFamily: "Inter",
    primaryColor: "#7C3AED",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    showDonorName: true,
    showAmount: true,
    soundEnabled: false,
    customMessage: "Thanks for your donation!",
  })

  const handleChange = (field: string, value: any) => {
    setOverlaySettings((prev) => ({ ...prev, [field]: value }))
  }

  const handleCopyUrl = () => {
    const overlayUrl = `${window.location.origin}/overlay/${overlaySettings.campaignId || "preview"}`
    navigator.clipboard.writeText(overlayUrl)
    toast({
      title: "URL copied!",
    })
  }

  return (
    <main className="container py-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold mb-4">Stream Overlay Generator</h1>
        <p className="text-muted-foreground mb-6">Create a custom overlay to display donation alerts on your stream</p>

        <div className="border rounded p-4 mb-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="campaignId">Select Campaign</Label>
              <Select value={overlaySettings.campaignId} onValueChange={(value) => handleChange("campaignId", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a campaign" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">Gaming Marathon for Charity</SelectItem>
                  <SelectItem value="2">New Streaming Setup</SelectItem>
                  <SelectItem value="3">Indie Game Development</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="customMessage">Alert Message</Label>
              <Input
                id="customMessage"
                value={overlaySettings.customMessage}
                onChange={(e) => handleChange("customMessage", e.target.value)}
                placeholder="Thanks for your donation!"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="fontFamily">Font</Label>
                <Select value={overlaySettings.fontFamily} onValueChange={(value) => handleChange("fontFamily", value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Inter">Inter</SelectItem>
                    <SelectItem value="Arial">Arial</SelectItem>
                    <SelectItem value="Roboto">Roboto</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="primaryColor">Text Color</Label>
                <Input
                  id="primaryColor"
                  type="color"
                  value={overlaySettings.primaryColor}
                  onChange={(e) => handleChange("primaryColor", e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="showDonorName"
                  checked={overlaySettings.showDonorName}
                  onCheckedChange={(checked) => handleChange("showDonorName", checked)}
                />
                <Label htmlFor="showDonorName">Show Donor Name</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="showAmount"
                  checked={overlaySettings.showAmount}
                  onCheckedChange={(checked) => handleChange("showAmount", checked)}
                />
                <Label htmlFor="showAmount">Show Amount</Label>
              </div>
            </div>
          </div>
        </div>

        <div className="border rounded p-4 mb-6">
          <h2 className="font-bold mb-4">Preview</h2>
          <div className="w-full h-32 rounded bg-gray-800 relative mb-4">
            <div
              className="absolute bottom-0 left-0 right-0 p-4 m-4 rounded"
              style={{
                backgroundColor: overlaySettings.backgroundColor,
                color: overlaySettings.primaryColor,
                fontFamily: overlaySettings.fontFamily,
                fontSize: `${overlaySettings.fontSize}px`,
              }}
            >
              <div className="flex flex-col items-center justify-center">
                {overlaySettings.showDonorName && <div className="font-bold">Donor123</div>}
                {overlaySettings.showAmount && <div>donated 0.05 ETH</div>}
                <div className="mt-2">{overlaySettings.customMessage}</div>
              </div>
            </div>
          </div>
        </div>

        <div className="border rounded p-4">
          <h2 className="font-bold mb-4">Overlay URL</h2>
          <p className="text-sm mb-4">Add this URL as a browser source in OBS or Streamlabs:</p>

          <div className="flex items-center gap-2">
            <Input value={`${window.location.origin}/overlay/${overlaySettings.campaignId || "preview"}`} readOnly />
            <Button onClick={handleCopyUrl} size="icon">
              <Copy className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </main>
  )
}

