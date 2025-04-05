"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Wallet } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface WalletConnectProps {
  onConnected?: (connected: boolean) => void;
}

export function WalletConnect({ onConnected }: WalletConnectProps) {
  const [account, setAccount] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const { toast } = useToast();

  const connectWallet = async () => {
    try {
      setIsConnecting(true);
      const { ethereum } = window as any;

      if (!ethereum) {
        toast({
          title: "MetaMask not found",
          description: "Please install MetaMask browser extension",
        });
        return;
      }

      const accounts = await ethereum.request({
        method: "eth_requestAccounts",
      });

      if (accounts.length > 0) {
        setAccount(accounts[0]);
        toast({
          title: "Wallet connected",
        });

        if (onConnected) {
          onConnected(true);
        }
      }
    } catch (error: any) {
      console.error(error);
      if (onConnected) {
        onConnected(false);
      }
    } finally {
      setIsConnecting(false);
    }
  };

  useEffect(() => {
    const checkWallet = async () => {
      const { ethereum } = window as any;
      if (ethereum) {
        const accounts = await ethereum.request({ method: "eth_accounts" });
        if (accounts.length > 0) {
          setAccount(accounts[0]);
          if (onConnected) {
            onConnected(true);
          }
        } else if (onConnected) {
          onConnected(false);
        }
      }
    };

    checkWallet();

    // Listen for account changes
    const { ethereum } = window as any;
    if (ethereum) {
      ethereum.on("accountsChanged", (accounts: string[]) => {
        if (accounts.length > 0) {
          setAccount(accounts[0]);
          if (onConnected) {
            onConnected(true);
          }
        } else {
          setAccount(null);
          if (onConnected) {
            onConnected(false);
          }
        }
      });
    }

    return () => {
      const { ethereum } = window as any;
      if (ethereum) {
        ethereum.removeListener("accountsChanged", () => {});
      }
    };
  }, [onConnected]);

  return (
    <div>
      {account ? (
        <Button
          variant="outline"
          size="sm"
          className="text-black bg-white border-gray-300"
        >
          <Wallet className="h-4 w-4 mr-2" />
          {`${account.substring(0, 6)}...${account.substring(
            account.length - 4
          )}`}
        </Button>
      ) : (
        <Button onClick={connectWallet} disabled={isConnecting} size="sm">
          <Wallet className="h-4 w-4 mr-2" />
          {isConnecting ? "Connecting..." : "Connect Wallet"}
        </Button>
      )}
    </div>
  );
}
