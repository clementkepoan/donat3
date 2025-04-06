"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { WalletConnect } from "@/components/wallet-connect";
import { Loader2, Upload, ImageIcon, AlertTriangle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import Image from "next/image";
import { ethers } from "ethers";
import axios from "axios";

import * as MultiBaas from "@curvegrid/multibaas-sdk";
import { isAxiosError } from "axios";

export default function MintPage() {
  const { toast } = useToast();
  const [nftName, setNftName] = useState("");
  const [nftDescription, setNftDescription] = useState("");
  const [recipientAddress, setRecipientAddress] = useState("");
  const [isMinting, setIsMinting] = useState(false);
  const [walletConnected, setWalletConnected] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [networkError, setNetworkError] = useState<string | null>(null);

  // Pinata API credentials
  const pinataApiKey = process.env.NEXT_PUBLIC_PINATA_API_KEY;
  const pinataSecretApiKey = process.env.NEXT_PUBLIC_PINATA_API_SECRET;

  const [isMinted, setIsMinted] = useState(false);

  // Add useEffect to check network when component mounts
  useEffect(() => {
    checkNetwork();
  }, []);

  // Add network checking function
  const checkNetwork = async () => {
    try {
      if (window.ethereum) {
        const chainId = await window.ethereum.request({
          method: "eth_chainId",
        });
        // Polygon Amoy testnet chainId is 80002 (0x13882 in hex)
        if (chainId !== "0x13882") {
          setNetworkError(
            "Please connect to Polygon Amoy Testnet to mint NFTs"
          );
        } else {
          setNetworkError(null);
        }
      }
    } catch (error) {
      console.error("Error checking network:", error);
    }
  };

  // Add network switching function
  const switchToPolygonAmoy = async () => {
    try {
      if (!window.ethereum) return;

      try {
        // Try to switch to Polygon Amoy testnet
        await window.ethereum.request({
          method: "wallet_switchEthereumChain",
          params: [{ chainId: "0x13882" }], // 80002 in hex
        });
        setNetworkError(null);
      } catch (switchError: any) {
        // This error code indicates that the chain has not been added to MetaMask
        if (switchError.code === 4902) {
          await window.ethereum.request({
            method: "wallet_addEthereumChain",
            params: [
              {
                chainId: "0x13882",
                chainName: "Polygon Amoy Testnet",
                nativeCurrency: {
                  name: "MATIC",
                  symbol: "MATIC",
                  decimals: 18,
                },
                rpcUrls: ["https://rpc-amoy.polygon.technology/"],
                blockExplorerUrls: ["https://amoy.polygonscan.com/"],
              },
            ],
          });
          setNetworkError(null);
        } else {
          console.error("Failed to switch network:", switchError);
        }
      }
    } catch (error) {
      console.error("Error switching network:", error);
    }
  };

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

  async function uploadImageToPinata(file: File) {
    try {
      console.log("Starting upload to Pinata...");

      // Create form data for Pinata upload
      const formData = new FormData();
      formData.append("file", file);

      // Add metadata
      const metadata = JSON.stringify({
        name: nftName,
        description: nftDescription,
      });
      formData.append("pinataMetadata", metadata);

      // Add options (optional)
      const options = JSON.stringify({
        cidVersion: 0,
      });
      formData.append("pinataOptions", options);

      // Upload file to Pinata
      const response = await axios.post(
        "https://api.pinata.cloud/pinning/pinFileToIPFS",
        formData,
        {
          headers: {
            "Content-Type": `multipart/form-data; boundary=${
              (formData as any)._boundary
            }`,
            pinata_api_key: pinataApiKey,
            pinata_secret_api_key: pinataSecretApiKey,
          },
        }
      );

      console.log("Pinata upload response:", response.data);

      // Format the IPFS URI
      const ipfsHash = response.data.IpfsHash;
      const ipfsUri = `ipfs://${ipfsHash}`;
      console.log("IPFS URI:", ipfsUri);

      return ipfsUri;
    } catch (error) {
      console.error("Error uploading to Pinata:", error);
      if (isAxiosError(error) && error.response) {
        console.error("Pinata API error:", error.response.data);
      }
      throw error;
    }
  }

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

    // Add network error check
    if (networkError) {
      toast({
        title: "Network Error",
        description: "Please switch to Polygon Amoy Testnet before minting",
        variant: "destructive",
      });
      return;
    }

    setIsMinting(true);

    try {
      // Upload image to IPFS via Pinata
      const ipfsUri = await uploadImageToPinata(imageFile);
      if (!ipfsUri) {
        throw new Error("Failed to upload image to IPFS");
      }

      console.log("Image uploaded to IPFS:", ipfsUri);

      const config = new MultiBaas.Configuration({
        basePath: "https://mnwgs2zohnd7fkhw7mkipjaazy.multibaas.com/api/v0",
        accessToken: process.env.NEXT_PUBLIC_MULTIBAAS_API_KEY,
      });
      console.log(process.env.NEXT_PUBLIC_MULTIBAAS_API_KEY);
      const contractsApi = new MultiBaas.ContractsApi(config);

      const chain = "ethereum";
      const deployedAddressOrAlias = "mynftamoy1";
      const contractLabel = "mynftamoy";
      const contractMethod = "mint";
      const account = await window.ethereum.request({
        method: "eth_requestAccounts",
      });
      const accountAddress = account[0];

      const payload: MultiBaas.PostMethodArgs = {
        args: [accountAddress, ipfsUri, nftName, nftDescription],
        from: accountAddress,
      };

      try {
        const resp = await contractsApi.callContractFunction(
          chain,
          deployedAddressOrAlias,
          contractLabel,
          contractMethod,
          payload
        );
        console.log("Function call result:\n", resp.data.result);

        // Check if the result contains transaction data
        if (resp.data.result && "tx" in resp.data.result) {
          signAndSendTransaction(formatTransaction(resp.data.result.tx));
          //console.log("Transaction data:\n", resp.data.result.tx);
        } else {
          console.error(
            "No transaction data in the response:",
            resp.data.result
          );
          throw new Error("No transaction data available to send");
        }
      } catch (e) {
        if (isAxiosError(e) && e.response?.data) {
          console.log(
            `MultiBaas error with status '${e.response.data.status}' and message: ${e.response.data.message}`
          );
        } else {
          console.log("An unexpected error occurred:", e);
        }
      }

      toast({
        title: "NFT minted successfully!",
        description:
          "Your NFT has been minted and will appear in your wallet soon",
      });

      setIsMinted(true);
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

  function formatTransaction(txData: any) {
    const formattedTx = JSON.parse(JSON.stringify(txData));

    // Convert fields that need to be converted
    // Handle BigInt conversion properly
    formattedTx.value = formattedTx.value
      ? BigInt(formattedTx.value).toString()
      : "0";

    // Set a reasonable gasLimit if it's undefined (3000000 in hex)
    if (!formattedTx.gasLimit && !formattedTx.gas) {
      formattedTx.gasLimit = "0x2DC6C0"; // 3,000,000 gas units
    } else if (formattedTx.gas && !formattedTx.gasLimit) {
      formattedTx.gasLimit = formattedTx.gas;
    }

    // Delete the gas field as we're using gasLimit
    delete formattedTx.gas;

    // let the wallet decide on the following parameters:
    delete formattedTx.nonce;
    delete formattedTx.gasPrice;
    delete formattedTx.gasFeeCap;
    delete formattedTx.gasTipCap;
    delete formattedTx.from;
    delete formattedTx.hash;
    return formattedTx;
    //formattedTx.maxPriorityFeePerGas = "0x8F0D180";

    //formattedTx.maxFeePerGas = "0x11E1A300"; // 3x the maxPriorityFeePerGas

    // Log the formatted transaction for debugging
  }

  async function signAndSendTransaction(txData: any) {
    try {
      if (typeof ethers === "undefined") {
        throw new Error("ethers.js is not loaded.");
      }

      if (!window.ethereum) {
        throw new Error("No Web3 provider detected.");
      }

      // Connect to the provider
      const provider = new ethers.BrowserProvider(window.ethereum);
      console.log("Connected to provider");

      // Request account access
      const accounts = await provider.send("eth_requestAccounts", []);
      const address = accounts[0];
      console.log("Connected account:", address);

      // Reformat transaction for ethers.js and web3 browser-based wallet
      const formattedTx = formatTransaction(txData);
      console.log("Transaction to sign:", formattedTx);

      const signer = await provider.getSigner();
      const tx = await signer.sendTransaction(formattedTx);
      console.log("Transaction sent!");
      console.log("Transaction hash:", tx.hash);
      console.log("Full response:", tx);

      return tx;
    } catch (error) {
      console.error("Error during transaction signing:", error);
      throw error;
    }
  }

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

        {/* Add network error alert */}
        {networkError && (
          <Alert className="border-yellow-500/20 bg-yellow-500/5">
            <AlertTriangle className="h-4 w-4 text-yellow-500" />
            <AlertDescription className="text-sm text-gray-400 flex justify-between items-center w-full">
              <span>{networkError}</span>
              <Button
                size="sm"
                variant="outline"
                className="bg-yellow-500/10 border-yellow-500/20 text-yellow-500 hover:bg-yellow-500/20"
                onClick={switchToPolygonAmoy}
              >
                Switch to Polygon Amoy
              </Button>
            </AlertDescription>
          </Alert>
        )}

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
              disabled={isMinting || !walletConnected || !!networkError}
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

            {isMinted && (
              <div className="text-center text-sm mt-6 p-4 bg-[#10B981]/10 border border-[#10B981]/20 rounded-xl">
                <p className="font-medium text-green-400">
                  NFT minted successfully!
                </p>
                <a
                  href={`https://amoy.polygonscan.com/`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#10B981] hover:underline flex items-center justify-center gap-1 mt-2 font-medium text-xs"
                >
                  View on Polygon Amoy Explorer
                </a>
              </div>
            )}
          </form>
        </div>
      </div>
    </main>
  );
}
