"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { Copy, Zap, Palette, WifiIcon, Volume2 } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";

import { useOverlay } from "@/hooks/overlayContext";
import DonationAlert from "@/components/donation-alert";
import { useEffect, useState } from "react";

export default function OverlayPage() {
  const { toast } = useToast();
  const [url, setUrl] = useState<string | null>(null);

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

    setBorderStyle,
    setCustomMessage,
    setFontFamily,
    setFontSize,
    setPrimaryColor,
    setBackgroundColor,
    setAccentColor,
    setShowAmount,
    setShowDonorName,
  } = useOverlay();

  useEffect(() => {
    const getIdByAddress = async () => {
      const account = await window.ethereum.request({
        method: "eth_requestAccounts",
      });
      const address = account[0];
      console.log("Address:", address);

      const response = await fetch(
        "http://localhost:8000/metadata/get_id_by_address",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            public_address: address,
          }),
        }
      );
      const data = await response.json();
      console.log("Response data:", data);

      if (response.ok) {
        setUrl(`${window.location.origin}/overlay/donation/${data.id}`);
      } else {
        console.error("Error fetching ID:", data.error);
      }
    };
    getIdByAddress();
  }, []);

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(url!);
    toast({
      title: "URL copied to clipboard!",
      description: "Paste this in your streaming software",
      variant: "default",
    });
  };

  return (
    <main className="py-8 bg-[#0A0A0F] min-h-screen text-gray-100">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-3 mb-2">
          <Zap className="h-6 w-6 text-[#10B981]" />
          <h1 className="text-3xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r text-white">
            Web3 Overlay Creator
          </h1>
        </div>
        <p className="text-gray-400 mb-8 pl-9">
          Create stunning donation alerts for your crypto streams
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6">
            <div className="backdrop-blur-sm bg-black/30 rounded-xl p-6 border border-gray-800 shadow-xl">
              <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                <Palette className="h-5 w-5 text-[#10B981]" />
                Visual Settings
              </h2>

              <div className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="customMessage">Alert Message</Label>
                  <Input
                    id="customMessage"
                    value={customMessage}
                    onChange={(e) => setCustomMessage!(e.target.value)}
                    placeholder="Thanks for your donation!"
                    className="bg-gray-900/50 border-gray-700"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="fontFamily">Font Family</Label>
                    <Select
                      value={fontFamily}
                      onValueChange={(value) => setFontFamily!(value)}
                      defaultValue="Inter"
                    >
                      <SelectTrigger className="bg-gray-900/50 border-gray-700">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-900 border-gray-700">
                        <SelectItem value="Inter">Inter</SelectItem>
                        <SelectItem value="Montserrat">Montserrat</SelectItem>
                        <SelectItem value="Space Mono">Space Mono</SelectItem>
                        <SelectItem value="Roboto">Roboto</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="fontSize">Font Size: {fontSize}px</Label>
                    <Slider
                      id="fontSize"
                      min={16}
                      max={48}
                      step={1}
                      defaultValue={[fontSize!]}
                      onValueChange={([value]) => setFontSize!(value)}
                      className="py-2"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="primaryColor">Text Color</Label>
                    <div className="flex items-center gap-2">
                      <div
                        className="h-10 w-10 rounded-md border border-gray-600"
                        style={{
                          backgroundColor: primaryColor,
                        }}
                      />
                      <Input
                        id="primaryColor"
                        type="color"
                        value={primaryColor}
                        onChange={(e) => setPrimaryColor!(e.target.value)}
                        className="w-full h-10"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="backgroundColor">Background</Label>
                    <div className="flex items-center gap-2">
                      <div
                        className="h-10 w-10 rounded-md border border-gray-600 bg-opacity-20"
                        style={{
                          backgroundColor: backgroundColor,
                        }}
                      />
                      <Input
                        id="backgroundColor"
                        type="color"
                        value={backgroundColor!
                          .replace("rgba", "rgb")
                          .replace(/,\s*[\d.]+\)/, ")")}
                        onChange={(e) => {
                          // Convert hex to rgba with 0.85 opacity
                          const hex = e.target.value;
                          const r = parseInt(hex.slice(1, 3), 16);
                          const g = parseInt(hex.slice(3, 5), 16);
                          const b = parseInt(hex.slice(5, 7), 16);
                          setBackgroundColor!(`rgba(${r}, ${g}, ${b}, 0.85)`);
                        }}
                        className="w-full h-10"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="accentColor">Accent Color</Label>
                    <div className="flex items-center gap-2">
                      <div
                        className="h-10 w-10 rounded-md border border-gray-600"
                        style={{ backgroundColor: accentColor }}
                      />
                      <Input
                        id="accentColor"
                        type="color"
                        value={accentColor}
                        onChange={(e) => setAccentColor!(e.target.value)}
                        className="w-full h-10"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="borderStyle">Border Style</Label>
                  <Select
                    value={borderStyle}
                    onValueChange={(value) => setBorderStyle!(value)}
                  >
                    <SelectTrigger className="bg-gray-900/50 border-gray-700">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-900 border-gray-700">
                      <SelectItem value="none">None</SelectItem>
                      <SelectItem value="solid">Solid</SelectItem>
                      <SelectItem value="gradient">Gradient</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="showDonorName"
                      checked={showDonorName}
                      onCheckedChange={(checked) => setShowDonorName!(checked)}
                      className={cn(
                        showDonorName ? "bg-[#10B981]" : "bg-gray-700"
                      )}
                    />
                    <Label htmlFor="showDonorName">Show Donor Name</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="showAmount"
                      checked={showAmount}
                      onCheckedChange={(checked) => setShowAmount!(checked)}
                      className={cn(
                        showAmount ? "bg-[#10B981]" : "bg-gray-700"
                      )}
                    />
                    <Label htmlFor="showAmount">Show Amount</Label>
                  </div>
                </div>
              </div>
            </div>

            <div className="backdrop-blur-sm bg-black/30 rounded-xl p-6 border border-gray-800 shadow-xl">
              <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                <WifiIcon className="h-5 w-5 text-[#10B981]" />
                Stream Integration
              </h2>

              <p className="text-sm text-gray-400 mb-4">
                Add this URL as a browser source in OBS or Streamlabs:
              </p>

              <div className="flex items-center gap-2">
                <Input
                  value={`${url}`}
                  readOnly
                  className="bg-gray-900/50 border-gray-700 font-mono text-sm"
                />
                <Button
                  onClick={handleCopyUrl}
                  size="icon"
                  className="bg-[#10B981] hover:bg-[#0D9668] text-black"
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          <div className="md:col-span-1">
            <div className="backdrop-blur-sm bg-black/30 rounded-xl border border-gray-800 shadow-xl sticky">
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
              />
            </div>

            <div className="mt-4 text-xs text-gray-500">
              <p>This is how your donation alerts will appear on stream.</p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
