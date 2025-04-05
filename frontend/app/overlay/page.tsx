"use client";

import { useState } from "react";
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

export default function OverlayPage() {
  const { toast } = useToast();
  const [overlaySettings, setOverlaySettings] = useState({
    alertDuration: 5,
    fontSize: 24,
    fontFamily: "Inter",
    primaryColor: "#7C3AED",
    backgroundColor: "rgba(17, 24, 39, 0.85)",
    accentColor: "#10B981",
    showDonorName: true,
    showAmount: true,
    soundEnabled: false,
    customMessage: "Thanks for your donation!",
    borderStyle: "gradient", // none, solid, gradient
  });

  const handleChange = (field: string, value: any) => {
    setOverlaySettings((prev) => ({ ...prev, [field]: value }));
  };

  const handleCopyUrl = () => {
    const overlayUrl = `${window.location.origin}/overlay/preview`;
    navigator.clipboard.writeText(overlayUrl);
    toast({
      title: "URL copied to clipboard!",
      description: "Paste this in your streaming software",
      variant: "default",
    });
  };

  const getBorderStyle = () => {
    switch (overlaySettings.borderStyle) {
      case "none":
        return {};
      case "solid":
        return { border: `2px solid ${overlaySettings.accentColor}` };
      case "gradient":
        return {
          border: "2px solid transparent",
          backgroundClip: "padding-box",
          WebkitBackgroundClip: "padding-box",
          backgroundImage: `linear-gradient(${overlaySettings.backgroundColor}, ${overlaySettings.backgroundColor}), 
                          linear-gradient(135deg, ${overlaySettings.accentColor}, ${overlaySettings.primaryColor})`,
        };
      default:
        return {};
    }
  };

  return (
    <main className="py-8 bg-[#0A0A0F] min-h-screen text-gray-100">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-3 mb-2">
          <Zap className="h-6 w-6 text-[#10B981]" />
          <h1 className="text-3xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-purple-500 to-cyan-500">
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
                    value={overlaySettings.customMessage}
                    onChange={(e) =>
                      handleChange("customMessage", e.target.value)
                    }
                    placeholder="Thanks for your donation!"
                    className="bg-gray-900/50 border-gray-700"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="fontFamily">Font Family</Label>
                    <Select
                      value={overlaySettings.fontFamily}
                      onValueChange={(value) =>
                        handleChange("fontFamily", value)
                      }
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
                    <Label htmlFor="fontSize">
                      Font Size: {overlaySettings.fontSize}px
                    </Label>
                    <Slider
                      id="fontSize"
                      min={16}
                      max={48}
                      step={1}
                      defaultValue={[overlaySettings.fontSize]}
                      onValueChange={([value]) =>
                        handleChange("fontSize", value)
                      }
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
                          backgroundColor: overlaySettings.primaryColor,
                        }}
                      />
                      <Input
                        id="primaryColor"
                        type="color"
                        value={overlaySettings.primaryColor}
                        onChange={(e) =>
                          handleChange("primaryColor", e.target.value)
                        }
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
                          backgroundColor: overlaySettings.backgroundColor,
                        }}
                      />
                      <Input
                        id="backgroundColor"
                        type="color"
                        value={overlaySettings.backgroundColor
                          .replace("rgba", "rgb")
                          .replace(/,\s*[\d.]+\)/, ")")}
                        onChange={(e) => {
                          // Convert hex to rgba with 0.85 opacity
                          const hex = e.target.value;
                          const r = parseInt(hex.slice(1, 3), 16);
                          const g = parseInt(hex.slice(3, 5), 16);
                          const b = parseInt(hex.slice(5, 7), 16);
                          handleChange(
                            "backgroundColor",
                            `rgba(${r}, ${g}, ${b}, 0.85)`
                          );
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
                        style={{ backgroundColor: overlaySettings.accentColor }}
                      />
                      <Input
                        id="accentColor"
                        type="color"
                        value={overlaySettings.accentColor}
                        onChange={(e) =>
                          handleChange("accentColor", e.target.value)
                        }
                        className="w-full h-10"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="borderStyle">Border Style</Label>
                  <Select
                    value={overlaySettings.borderStyle}
                    onValueChange={(value) =>
                      handleChange("borderStyle", value)
                    }
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
                      checked={overlaySettings.showDonorName}
                      onCheckedChange={(checked) =>
                        handleChange("showDonorName", checked)
                      }
                      className={cn(
                        overlaySettings.showDonorName
                          ? "bg-[#10B981]"
                          : "bg-gray-700"
                      )}
                    />
                    <Label htmlFor="showDonorName">Show Donor Name</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="showAmount"
                      checked={overlaySettings.showAmount}
                      onCheckedChange={(checked) =>
                        handleChange("showAmount", checked)
                      }
                      className={cn(
                        overlaySettings.showAmount
                          ? "bg-[#10B981]"
                          : "bg-gray-700"
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
                  value={`${window.location.origin}/overlay/preview`}
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
            <div className="backdrop-blur-sm bg-black/30 rounded-xl p-6 border border-gray-800 shadow-xl sticky top-6">
              <h2 className="text-xl font-bold mb-6">Preview</h2>

              <div className="w-full aspect-video rounded-lg bg-gray-900/50 relative flex items-center justify-center p-4 overflow-hidden">
                <div className="absolute inset-0 flex items-center justify-center p-3">
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-cyan-500/10 animate-pulse"></div>
                  <div
                    className="w-full mx-auto p-4 m-2 rounded-lg"
                    style={{
                      backgroundColor: overlaySettings.backgroundColor,
                      color: overlaySettings.primaryColor,
                      fontFamily: overlaySettings.fontFamily,
                      fontSize: `${overlaySettings.fontSize}px`,
                      ...getBorderStyle(),
                    }}
                  >
                    <div className="flex flex-col items-center justify-center text-center">
                      {overlaySettings.showDonorName && (
                        <div className="font-bold truncate w-full">
                          eth_donor.eth
                        </div>
                      )}
                      {overlaySettings.showAmount && (
                        <div className="flex items-center gap-1 text-sm">
                          <span style={{ color: overlaySettings.accentColor }}>
                            donated 0.05 ETH
                          </span>
                        </div>
                      )}
                      <div className="mt-1">
                        {overlaySettings.customMessage}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-4 text-xs text-gray-500">
                <p>This is how your donation alerts will appear on stream.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
