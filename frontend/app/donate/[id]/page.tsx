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
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import Link from "next/link";
import Image from "next/image";
import { useParams } from "next/navigation";

import { Streamer } from "@/app/layout";

export default function StreamerDonatePage() {
  const params = useParams();
  const id = params.id as string;

  const { toast } = useToast();
  const [streamer, setStreamer] = useState<Streamer | null>(null);
  const [donationAmount, setDonationAmount] = useState("");
  const [donationMessage, setDonationMessage] = useState("");
  const [isDonating, setIsDonating] = useState(false);
  const [walletConnected, setWalletConnected] = useState(false);
  const [transactionHash, setTransactionHash] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
        console.log("Streamer data:", response, response.ok);
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
  }, []);

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

    setIsDonating(true);

    try {
      // Get the Ethereum provider from window.ethereum
      const { ethereum } = window as any;

      if (!ethereum) {
        throw new Error("MetaMask is not installed");
      }

      // Get the current account
      const accounts = await ethereum.request({ method: "eth_accounts" });
      if (accounts.length === 0) {
        throw new Error("No account connected");
      }

      const fromAddress = accounts[0];
      const toAddress = streamer?.public_address;

      if (!toAddress) {
        throw new Error("Streamer wallet address not available");
      }

      // Convert ETH amount to Wei (1 ETH = 10^18 Wei)
      const amountInWei = BigInt(Number.parseFloat(donationAmount) * 1e18);

      // Prepare the transaction
      const transactionParameters = {
        from: fromAddress,
        to: toAddress,
        value: `0x${amountInWei.toString(16)}`, // Convert to hexadecimal
        gas: "0x5208", // 21000 gas (standard transaction)
      };

      // Send the transaction
      const txHash = await ethereum.request({
        method: "eth_sendTransaction",
        params: [transactionParameters],
      });

      setTransactionHash(txHash);

      // Store donation details in the backend
      await fetch("/api/donations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          streamerId: streamer._id,
          amount: donationAmount,
          message: donationMessage,
          transactionHash: txHash,
          senderAddress: fromAddress,
        }),
      });

      toast({
        title: "Donation successful!",
        description: `You've successfully donated to ${streamer.name}`,
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
      <main className="py-8 bg-gradient-to-b from-background to-slate-50 dark:from-background dark:to-slate-950 min-h-screen">
        <div className="max-w-3xl mx-auto flex justify-center py-12">
          <div className="flex flex-col items-center">
            <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
            <p className="text-muted-foreground animate-pulse">
              Loading creator details...
            </p>
          </div>
        </div>
      </main>
    );
  }

  if (!streamer) {
    return (
      <main className="py-8 bg-gradient-to-b from-background to-slate-50 dark:from-background dark:to-slate-950 min-h-screen">
        <div className="max-w-3xl mx-auto">
          <div className="mb-4">
            <Link
              href="/donate"
              className="text-sm text-muted-foreground hover:text-foreground flex items-center transition-colors duration-200"
            >
              <ArrowLeft className="h-4 w-4 mr-1" /> Back to creators
            </Link>
          </div>

          <div className="text-center py-12 border rounded-xl bg-card/50 backdrop-blur-sm shadow-md">
            <AlertCircle className="h-16 w-16 mx-auto text-destructive/80 mb-4" />
            <h2 className="text-2xl font-bold mb-2">Creator Not Found</h2>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              We couldn't find the creator you're looking for. They may have
              changed their username or deactivated their account.
            </p>
            <Link href="/donate">
              <Button
                size="lg"
                className="px-8 py-6 h-auto rounded-full font-semibold text-base"
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
    <main className="py-8 bg-gradient-to-b from-background to-slate-50 dark:from-background dark:to-slate-950 min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <div className="mb-6">
          <Link
            href="/donate"
            className="text-sm text-muted-foreground hover:text-foreground flex items-center group transition-colors duration-200"
          >
            <ArrowLeft className="h-4 w-4 mr-1.5 group-hover:-translate-x-0.5 transition-transform" />{" "}
            Back to creators
          </Link>
        </div>

        <div className="border border-border/40 rounded-2xl overflow-hidden mb-8 shadow-lg bg-card/80 backdrop-blur-sm">
          <div className="bg-muted h-48 relative">
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
            <div className="relative h-28 w-28 -mt-14 border-4 border-background rounded-full overflow-hidden shadow-xl">
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
                  <h1 className="text-3xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-primary to-violet-500">
                    {streamer.name}
                  </h1>
                </div>
              </div>

              <div className="flex items-center mt-3 text-sm space-x-6">
                <div className="flex items-center px-3 py-1.5 rounded-full bg-primary/10 text-primary">
                  <Users className="h-4 w-4 mr-1.5" />
                  <span className="font-medium">
                    {streamer.subscribers.toLocaleString()} followers
                  </span>
                </div>
                <div className="flex items-center px-3 py-1.5 rounded-full bg-secondary/10 text-secondary-foreground">
                  <Eye className="h-4 w-4 mr-1.5" />
                  <span className="font-medium">
                    {streamer.viewers} viewers
                  </span>
                </div>
              </div>

              <p className="mt-5 text-lg leading-relaxed text-muted-foreground">
                {streamer.description}
              </p>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-5 gap-34">
          <div className="md:col-span-3">
            <div className="border border-border/40 rounded-2xl p-6 bg-card/80 backdrop-blur-sm shadow-lg">
              <div className="flex items-center space-x-2 mb-6">
                <Gift className="h-5 w-5 text-primary" />
                <h2 className="text-xl font-bold">Support {streamer.name}</h2>
              </div>

              <form onSubmit={handleDonate} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="amount" className="text-base font-medium">
                    Amount (ETH)
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
                      className="pl-10 py-6 text-lg rounded-xl"
                    />
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM13.41 16.09V18H10.74V16.07C9.03 15.71 7.58 14.61 7.47 12.67H9.43C9.53 13.72 10.25 14.43 12.05 14.43C13.96 14.43 14.28 13.45 14.28 12.91C14.28 12.12 13.96 11.34 11.68 10.84C9.11 10.29 7.65 9.1 7.65 7.18C7.65 5.46 8.91 4.28 10.74 3.93V2H13.41V3.95C15.14 4.37 16.21 5.75 16.28 7.29H14.32C14.25 6.24 13.66 5.53 12.05 5.53C10.57 5.53 9.82 6.22 9.82 7.11C9.82 7.9 10.36 8.5 12.36 8.97C14.36 9.44 16.45 10.41 16.45 12.88C16.42 14.77 15.12 15.76 13.41 16.09Z"
                          fill="currentColor"
                        />
                      </svg>
                    </div>
                  </div>
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
                    className="resize-none rounded-xl text-base"
                  />
                </div>

                <div className="flex justify-center my-6">
                  <WalletConnect onConnected={setWalletConnected} />
                </div>

                <Button
                  type="submit"
                  className="w-full py-6 text-lg font-medium rounded-xl transition-all duration-200 shadow-lg hover:shadow-primary/25"
                  disabled={isDonating || !walletConnected}
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
                  <div className="mt-6 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-center">
                    <div className="inline-block p-2 rounded-full bg-emerald-100 dark:bg-emerald-900/30 mb-2">
                      <svg
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M12 22C17.5 22 22 17.5 22 12C22 6.5 17.5 2 12 2C6.5 2 2 6.5 2 12C2 17.5 6.5 22 12 22Z"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="stroke-emerald-500"
                        />
                        <path
                          d="M7.75 12L10.58 14.83L16.25 9.17"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="stroke-emerald-500"
                        />
                      </svg>
                    </div>
                    <p className="font-semibold text-base text-emerald-700 dark:text-emerald-300">
                      Donation successful!
                    </p>
                    <a
                      href={`https://etherscan.io/tx/${transactionHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline flex items-center justify-center gap-1 mt-2 font-medium"
                    >
                      View transaction on Etherscan{" "}
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                )}
              </form>
            </div>
          </div>

          <div className="md:col-span-2">
            <div className="border border-border/40 rounded-2xl p-6 bg-card/80 backdrop-blur-sm shadow-lg space-y-5">
              <div className="flex items-center space-x-2">
                <Wallet className="h-5 w-5 text-primary" />
                <h3 className="text-xl font-bold">Donation Info</h3>
              </div>

              <Alert className="border-primary/20 bg-primary/5">
                <AlertCircle className="h-4 w-4 text-primary" />
                <AlertDescription className="text-sm">
                  Donations are sent directly to {streamer.name}'s wallet with{" "}
                  <span className="font-bold">no platform fees</span>. Standard
                  network transaction fees apply.
                </AlertDescription>
              </Alert>

              <div className="py-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    Platform Fee
                  </span>
                  <span className="font-medium text-emerald-500">0%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    Creator Receives
                  </span>
                  <span className="font-medium">100% of donation</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    Payment Method
                  </span>
                  <span className="font-medium">Ethereum (ETH)</span>
                </div>
              </div>

              <div className="pt-3 border-t border-border/60">
                <p className="text-xs text-muted-foreground">
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
