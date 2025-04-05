"use client";

import type React from "react";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { WalletConnect } from "@/components/wallet-connect";
import { Loader2, Upload, ImageIcon } from "lucide-react";
import Image from "next/image";

export default function MintPage() {
  const { toast } = useToast();
  const [nftName, setNftName] = useState("");
  const [nftDescription, setNftDescription] = useState("");
  const [recipientAddress, setRecipientAddress] = useState("");
  const [isMinting, setIsMinting] = useState(false);
  const [walletConnected, setWalletConnected] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [transactionHash, setTransactionHash] = useState<string | null>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleMint = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!nftName || !imageFile) {
      toast({
        title: "Missing information",
        description: "Please provide a name and image for your NFT",
      });
      return;
    }

    if (!walletConnected) {
      toast({
        title: "Please connect your wallet first",
      });
      return;
    }

    setIsMinting(true);

    try {
      // In a real implementation, you would:
      // 1. Upload the image to IPFS
      // 2. Create metadata and upload to IPFS
      // 3. Call a smart contract to mint the NFT

      // Simulate minting process
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Mock transaction hash
      const mockTxHash =
        "0x" +
        Array(64)
          .fill(0)
          .map(() => Math.floor(Math.random() * 16).toString(16))
          .join("");

      setTransactionHash(mockTxHash);

      toast({
        title: "NFT minted successfully!",
        description:
          "Your NFT has been minted and will appear in your wallet soon",
      });
    } catch (error: any) {
      console.error("Minting error:", error);
      toast({
        title: "Minting failed",
        description: error.message || "There was an error minting your NFT",
        variant: "destructive",
      });
    } finally {
      setIsMinting(false);
    }
  };

  return (
    <main className="py-8">
      <div className="max-w-md mx-auto">
        <h1 className="text-2xl font-bold mb-6">Mint an NFT</h1>

        <div className="border rounded p-4">
          <form onSubmit={handleMint} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="nftImage">NFT Image</Label>
              <div
                className="flex items-center justify-center border-2 border-dashed rounded-md p-4 cursor-pointer"
                onClick={() => document.getElementById("nftImage")?.click()}
              >
                {imagePreview ? (
                  <div className="relative w-full aspect-square">
                    <Image
                      src={imagePreview || "/placeholder.svg"}
                      alt="NFT Preview"
                      fill
                      className="object-contain rounded-md"
                    />
                  </div>
                ) : (
                  <div className="flex flex-col items-center p-4">
                    <ImageIcon className="h-10 w-10 text-muted-foreground mb-2" />
                    <p className="text-sm text-muted-foreground">
                      Click to upload image
                    </p>
                  </div>
                )}
                <input
                  id="nftImage"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageChange}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="nftName">NFT Name</Label>
              <Input
                id="nftName"
                placeholder="My Awesome NFT"
                value={nftName}
                onChange={(e) => setNftName(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="nftDescription">Description (Optional)</Label>
              <Textarea
                id="nftDescription"
                placeholder="Describe your NFT"
                value={nftDescription}
                onChange={(e) => setNftDescription(e.target.value)}
                rows={2}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="recipient">Recipient Address (Optional)</Label>
              <Input
                id="recipient"
                placeholder="Leave empty to mint to your wallet"
                value={recipientAddress}
                onChange={(e) => setRecipientAddress(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                If left empty, the NFT will be minted to your connected wallet
              </p>
            </div>

            <div className="flex justify-center mb-2">
              <WalletConnect onConnected={setWalletConnected} />
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={isMinting || !walletConnected}
            >
              {isMinting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Minting...
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  Mint NFT
                </>
              )}
            </Button>

            {transactionHash && (
              <div className="text-center text-sm">
                <p className="font-medium">NFT minted successfully!</p>
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
          </form>
        </div>
      </div>
    </main>
  );
}
