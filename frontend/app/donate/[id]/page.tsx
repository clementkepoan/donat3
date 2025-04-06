"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { WalletConnect } from "@/components/wallet-connect";
import {
  Loader2,
  AlertCircle,
  ArrowLeft,
  Users,
  Eye,
  ExternalLink,
  Gift,
  Sparkles,
  Wallet,
  AlertTriangle,
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import Link from "next/link";
import Image from "next/image";
import { useParams } from "next/navigation";
import { Streamer } from "@/app/layout";
import { io, Socket } from "socket.io-client";
import { ethers } from "ethers";

// Contract ABI for PeerToPeerWithCommission
const CONTRACT_ABI = [
  {
    inputs: [
      {
        internalType: "uint256",
        name: "_commissionRate",
        type: "uint256",
      },
    ],
    stateMutability: "nonpayable",
    type: "constructor",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "owner",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
    ],
    name: "CommissionClaimed",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "sender",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "receiver",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "commission",
        type: "uint256",
      },
    ],
    name: "Transaction",
    type: "event",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "_newRate",
        type: "uint256",
      },
    ],
    name: "changeCommissionRate",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "claimCommission",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "commissionRate",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "owner",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "totalCommission",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address payable",
        name: "_receiver",
        type: "address",
      },
    ],
    name: "transfer",
    outputs: [],
    stateMutability: "payable",
    type: "function",
  },
];

// Contract address of the deployed PeerToPeerWithCommission contract
const CONTRACT_ADDRESS = "0x70950b30978fb9917B20dE0fd96a62e99ac9871C"; // Replace with actual contract address

export default function StreamerDonatePage() {
  const params = useParams();
  const id = params.id as string;

  const { toast } = useToast();
  const [streamer, setStreamer] = useState<Streamer | null>(null);
  const [donationAmount, setDonationAmount] = useState("");
  const [donationMessage, setDonationMessage] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [isDonating, setIsDonating] = useState(false);
  const [walletConnected, setWalletConnected] = useState(false);
  const [transactionHash, setTransactionHash] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [networkError, setNetworkError] = useState<string | null>(null);
  const [commissionRate, setCommissionRate] = useState<number | null>(null);

  useEffect(() => {
    async function getStreamerData() {
      try {
        setIsLoading(true);
        const response = await fetch(`http://localhost:8000/metadata/get_one`, {
          headers: {
            "Content-Type": "application/json",
          },
          method: "POST",
          body: JSON.stringify({
            id,
          }),
        });

        const data = await response.json();
        if (response.ok && data.streamer) {
          setStreamer({
            _id: data.streamer._id,
            name: data.streamer.name,
            image: data.streamer.image,
            subscribers: data.streamer.subscribers,
            public_address: data.streamer.public_address,
            viewers: data.streamer.viewers,
            description: data.streamer.description,
          });
        } else {
          setError("Streamer not found");
          toast({
            title: "Streamer not found",
            description: "The streamer you're looking for doesn't exist",
            variant: "destructive",
          });
        }
      } catch (err) {
        console.error("Error fetching streamer:", err);
        setError("Failed to load streamer profile");
        toast({
          title: "Streamer not found",
          description: "The streamer you're looking for doesn't exist",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    }

    getStreamerData();
    checkNetwork();
    getCommissionRate();
  }, [id]);

  // Check if user is on Flow EVM testnet
  const checkNetwork = async () => {
    try {
      if (window.ethereum) {
        const chainId = await window.ethereum.request({
          method: "eth_chainId",
        });
        if (chainId !== "0x221") {
          // Flow EVM testnet chainId is 545 (0x221 in hex)
          setNetworkError("Please connect to Flow EVM Testnet to donate");
        } else {
          setNetworkError(null);
        }
      }
    } catch (error) {
      console.error("Error checking network:", error);
    }
  };

  // Switch to Flow EVM Testnet
  const switchToFlowNetwork = async () => {
    try {
      if (!window.ethereum) return;

      try {
        // Try to switch to Flow testnet
        await window.ethereum.request({
          method: "wallet_switchEthereumChain",
          params: [{ chainId: "0x221" }], // 545 in hex
        });
        setNetworkError(null);
      } catch (switchError: any) {
        // This error code indicates that the chain has not been added to MetaMask
        if (switchError.code === 4902) {
          await window.ethereum.request({
            method: "wallet_addEthereumChain",
            params: [
              {
                chainId: "0x221", // 545 in hex
                chainName: "Flow EVM Testnet",
                nativeCurrency: {
                  name: "FLOW",
                  symbol: "FLOW",
                  decimals: 18,
                },
                rpcUrls: ["https://testnet.evm.nodes.onflow.org"],
                blockExplorerUrls: ["https://testnet-evm.flowscan.io"],
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

  // Get commission rate from contract
  const getCommissionRate = async () => {
    try {
      if (window.ethereum) {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const contract = new ethers.Contract(
          CONTRACT_ADDRESS,
          CONTRACT_ABI,
          provider
        );
        const rate = await contract.commissionRate();
        setCommissionRate(Number(rate));
      }
    } catch (error) {
      console.error("Error getting commission rate:", error);
    }
  };

  const handleDonate = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!donationAmount || Number.parseFloat(donationAmount) <= 0) {
      toast({
        title: "Please enter a valid amount",
      });
      return;
    }

    if (!walletConnected) {
      toast({
        title: "Please connect your wallet first",
      });
      return;
    }

    if (networkError) {
      toast({
        title: "Network Error",
        description: "Please switch to Flow EVM Testnet before donating",
        variant: "destructive",
      });
      return;
    }

    setIsDonating(true);

    try {
      const { ethereum } = window as any;

      if (!ethereum) {
        throw new Error("MetaMask is not installed");
      }

      const accounts = await ethereum.request({ method: "eth_accounts" });
      if (accounts.length === 0) {
        throw new Error("No account connected");
      }

      const fromAddress = accounts[0];
      const toAddress = streamer?.public_address;

      if (!toAddress) {
        throw new Error("Streamer wallet address not available");
      }

      // Create ethers provider and contract instance
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(
        CONTRACT_ADDRESS,
        CONTRACT_ABI,
        signer
      );

      // Convert donation amount to wei
      const amountInWei = ethers.parseEther(donationAmount);

      // Sign message to confirm the transaction
      await signer.signMessage(
        `I confirm donating ${donationAmount} FLOW to ${streamer.name}`
      );

      // Call the contract's transfer function
      const tx = await contract.transfer(toAddress, {
        value: amountInWei,
      });

      // Wait for transaction to be mined
      const receipt = await tx.wait();
      setTransactionHash(receipt.hash);

      // Record donation in backend
      await fetch("/api/donations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          streamerId: streamer._id,
          amount: donationAmount,
          message: donationMessage,
          transactionHash: receipt.hash,
          senderAddress: fromAddress,
        }),
      });

      toast({
        title: "Donation successful!",
        description: `You've successfully donated to ${streamer.name}`,
      });

      // Send data to socket server for alerts
      const socket = io("http://localhost:8000", {
        transports: ["websocket"],
      });
      socket.emit("donation", {
        id,
        name: displayName,
        donation: donationAmount,
      });

      setDonationAmount("");
      setDonationMessage("");
    } catch (error: any) {
      console.error("Donation error:", error);
      toast({
        title: "Donation failed",
        description:
          error.message || "There was an error processing your donation",
        variant: "destructive",
      });
    } finally {
      setIsDonating(false);
    }
  };

  if (isLoading) {
    return (
      <main className="py-8 bg-gradient-to-br from-[#0E0E12] via-[#101014] to-[#0E0E12] min-h-screen text-white">
        <div className="max-w-3xl mx-auto flex justify-center py-12">
          <div className="flex flex-col items-center">
            <Loader2 className="h-12 w-12 animate-spin text-[#10B981] mb-4" />
            <p className="text-gray-400 animate-pulse">
              Loading creator details...
            </p>
          </div>
        </div>
      </main>
    );
  }

  if (!streamer) {
    return (
      <main className="py-8 bg-gradient-to-br from-[#0E0E12] via-[#101014] to-[#0E0E12] min-h-screen text-white">
        <div className="max-w-3xl mx-auto">
          <div className="mb-4">
            <Link
              href="/donate"
              className="text-sm text-gray-400 hover:text-white flex items-center transition-colors duration-200"
            >
              <ArrowLeft className="h-4 w-4 mr-1" /> Back to creators
            </Link>
          </div>

          <div className="text-center py-12 border rounded-xl bg-[#18181D] backdrop-blur-sm shadow-md">
            <AlertCircle className="h-16 w-16 mx-auto text-red-500 mb-4" />
            <h2 className="text-2xl font-bold mb-2">Creator Not Found</h2>
            <p className="text-gray-400 mb-6 max-w-md mx-auto">
              We couldn't find the creator you're looking for. They may have
              changed their username or deactivated their account.
            </p>
            <Link href="/donate">
              <Button
                size="lg"
                className="px-8 py-6 h-auto rounded-full font-semibold text-base bg-[#10B981] text-white hover:bg-[#0E9E6E]"
              >
                Discover Creators
              </Button>
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="py-8 bg-gradient-to-br from-[#0E0E12] via-[#101014] to-[#0E0E12] min-h-screen text-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <div className="mb-6">
          <Link
            href="/donate"
            className="text-sm text-gray-400 hover:text-white flex items-center group transition-colors duration-200"
          >
            <ArrowLeft className="h-4 w-4 mr-1.5 group-hover:-translate-x-0.5 transition-transform" />{" "}
            Back to creators
          </Link>
        </div>

        {networkError && (
          <Alert className="mb-6 border-yellow-500/20 bg-yellow-500/5">
            <AlertTriangle className="h-4 w-4 text-yellow-500" />
            <AlertDescription className="text-sm text-gray-400 flex justify-between items-center w-full">
              <span>{networkError}</span>
              <Button
                size="sm"
                variant="outline"
                className="bg-yellow-500/10 border-yellow-500/20 text-yellow-500 hover:bg-yellow-500/20"
                onClick={switchToFlowNetwork}
              >
                Switch Network
              </Button>
            </AlertDescription>
          </Alert>
        )}

        <div className="border border-[#2A2A2E] rounded-2xl overflow-hidden mb-8 shadow-lg bg-[#18181D]">
          <div className="bg-[#121217] h-48 relative">
            <Image
              src={"/hero.jpg"}
              alt={`${streamer.name}'s banner`}
              fill
              className="object-cover"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          </div>

          <div className="p-8 pt-0 relative">
            <div className="relative h-28 w-28 -mt-14 border-4 border-[#0E0E12] rounded-full overflow-hidden shadow-xl">
              <Image
                src={streamer.image}
                alt={streamer.name}
                fill
                className="object-cover"
              />
            </div>

            <div className="mt-5">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-extrabold text-white">
                    {streamer.name}
                  </h1>
                </div>
              </div>

              <div className="flex items-center mt-3 text-sm space-x-6">
                <div className="flex items-center px-3 py-1.5 rounded-full bg-[#10B981]/10 text-[#10B981]">
                  <Users className="h-4 w-4 mr-1.5" />
                  <span className="font-medium">
                    {streamer.subscribers.toLocaleString()} followers
                  </span>
                </div>
                <div className="flex items-center px-3 py-1.5 rounded-full bg-[#3B82F6]/10 text-[#3B82F6]">
                  <Eye className="h-4 w-4 mr-1.5" />
                  <span className="font-medium">
                    {streamer.viewers} viewers
                  </span>
                </div>
              </div>

              <p className="mt-5 text-lg leading-relaxed text-gray-400">
                {streamer.description}
              </p>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-5 gap-6">
          <div className="md:col-span-3">
            <div className="border border-[#2A2A2E] rounded-2xl p-6 bg-[#18181D] shadow-lg">
              <div className="flex items-center space-x-2 mb-6">
                <Gift className="h-5 w-5 text-[#10B981]" />
                <h2 className="text-xl font-bold text-white">
                  Support {streamer.name}
                </h2>
              </div>

              <form onSubmit={handleDonate} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="amount" className="text-base font-medium">
                    Amount (FLOW)
                  </Label>
                  <div className="relative">
                    <Input
                      id="amount"
                      type="number"
                      step="0.001"
                      min="0.001"
                      placeholder="0.05"
                      value={donationAmount}
                      onChange={(e) => setDonationAmount(e.target.value)}
                      required
                      className="pl-10 py-6 text-lg rounded-xl bg-[#18181D] text-white border border-[#2A2A2E] placeholder-gray-400"
                    />
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                      <Wallet className="h-5 w-5" />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="name" className="text-base font-medium">
                    Display Name
                  </Label>
                  <Input
                    id="name"
                    placeholder={`Your name or alias`}
                    required
                    className="py-6 text-lg rounded-xl bg-[#18181D] text-white border border-[#2A2A2E] placeholder-gray-400"
                    onChange={(e) => setDisplayName(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="message" className="text-base font-medium">
                    Message (Optional)
                  </Label>
                  <Textarea
                    id="message"
                    placeholder={`Add a message to ${streamer.name}`}
                    value={donationMessage}
                    onChange={(e) => setDonationMessage(e.target.value)}
                    rows={3}
                    className="resize-none rounded-xl text-base bg-[#18181D] text-white border border-[#2A2A2E] placeholder-gray-400"
                  />
                </div>

                <div className="flex justify-center my-6">
                  <WalletConnect onConnected={setWalletConnected} />
                </div>

                <Button
                  type="submit"
                  className="w-full py-6 text-lg font-medium rounded-xl bg-[#10B981] text-white hover:bg-[#0E9E6E] shadow-lg hover:shadow-[#10B981]/25 transition-all duration-200"
                  disabled={isDonating || !walletConnected || !!networkError}
                >
                  {isDonating ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Processing transaction...
                    </>
                  ) : (
                    <>
                      <Sparkles className="mr-2 h-5 w-5" />
                      Support {streamer.name}
                    </>
                  )}
                </Button>

                {transactionHash && (
                  <div className="mt-6 p-4 bg-[#10B981]/10 border border-[#10B981]/20 rounded-xl text-center">
                    <div className="inline-block p-2 rounded-full bg-[#10B981]/20 mb-2">
                      <Sparkles className="h-6 w-6 text-[#10B981]" />
                    </div>
                    <p className="font-semibold text-base text-[#10B981]">
                      Donation successful!
                    </p>
                    <a
                      href={`https://testnet-evm.flowscan.io/tx/${transactionHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#10B981] hover:underline flex items-center justify-center gap-1 mt-2 font-medium"
                    >
                      View transaction on Flow Explorer{" "}
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                )}
              </form>
            </div>
          </div>

          <div className="md:col-span-2">
            <div className="border border-[#2A2A2E] rounded-2xl p-6 bg-[#18181D] shadow-lg space-y-5">
              <div className="flex items-center space-x-2">
                <Wallet className="h-5 w-5 text-[#10B981]" />
                <h3 className="text-xl font-bold text-white">Donation Info</h3>
              </div>

              <Alert className="border-[#10B981]/20 bg-[#10B981]/5">
                <AlertCircle className="h-4 w-4 text-[#10B981]" />
                <AlertDescription className="text-sm text-gray-400">
                  Donations are sent directly to {streamer.name}'s wallet using
                  our secure Flow EVM smart contract with a small platform fee.
                </AlertDescription>
              </Alert>

              <div className="py-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-400">Platform Fee</span>
                  <span className="font-medium text-[#10B981]">
                    {commissionRate ? `${commissionRate}%` : "Loading..."}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-400">
                    Creator Receives
                  </span>
                  <span className="font-medium text-white">
                    {commissionRate ? `${100 - commissionRate}%` : "Loading..."}{" "}
                    of donation
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-400">Payment Method</span>
                  <span className="font-medium text-white">Flow (FLOW)</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-400">Network</span>
                  <span className="font-medium text-white">
                    Flow EVM Testnet
                  </span>
                </div>
              </div>

              <div className="pt-3 border-t border-[#2A2A2E]">
                <p className="text-xs text-gray-400">
                  By donating, you agree to our Terms of Service and acknowledge
                  that donations are non-refundable.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
