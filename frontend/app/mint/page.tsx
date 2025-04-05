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
      await new Promise((resolve) => setTimeout(resolve, 2000));

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
    <main className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-black via-gray-900 to-black min-h-screen text-white font-sans">
      <div className="max-w-3xl mx-auto space-y-10">
        <div className="text-center">
          <h1 className="text-4xl font-extrabold bg-gradient-to-r from-[#2eb95c] to-[#5fa48d] bg-clip-text text-transparent mb-3">
            Mint Your NFT
          </h1>
          <p className="text-gray-400 text-sm max-w-md mx-auto">
            Upload your image, customize the details, and mint your NFT directly
            to the blockchain.
          </p>
        </div>

        <div className="bg-gray-900 border border-gray-800 p-8 rounded-3xl shadow-2xl">
          <form onSubmit={handleMint} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="nftImage">NFT Image</Label>
              <div
                className="flex items-center justify-center border-2 border-dashed rounded-lg p-6 cursor-pointer bg-gray-800 hover:bg-gray-700 transition"
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
                  <div className="flex flex-col items-center p-4 text-gray-400">
                    <ImageIcon className="h-10 w-10 mb-2" />
                    <p className="text-sm">Click to upload image</p>
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
                className="bg-gray-800 border-gray-700"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="nftDescription">Description (Optional)</Label>
              <Textarea
                id="nftDescription"
                placeholder="Describe your NFT"
                value={nftDescription}
                onChange={(e) => setNftDescription(e.target.value)}
                rows={3}
                className="bg-gray-800 border-gray-700"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="recipient">Recipient Address (Optional)</Label>
              <Input
                id="recipient"
                placeholder="Leave empty to mint to your wallet"
                value={recipientAddress}
                onChange={(e) => setRecipientAddress(e.target.value)}
                className="bg-gray-800 border-gray-700"
              />
              <p className="text-xs text-gray-400">
                If left empty, the NFT will be minted to your connected wallet.
              </p>
            </div>

            <div className="flex justify-center">
              <WalletConnect onConnected={setWalletConnected} />
            </div>

            <Button
              type="submit"
              className="w-full bg-[#10B981] hover:bg-[#0D9668] text-black font-semibold tracking-wide"
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
              <div className="text-center text-sm mt-6">
                <p className="font-medium text-green-400">
                  NFT minted successfully!
                </p>
                <a
                  href={`https://etherscan.io/tx/${transactionHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:underline"
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
