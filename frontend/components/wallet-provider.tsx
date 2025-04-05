"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";

const api_url = "http://localhost:8000";

declare global {
  interface Window {
    ethereum?: any;
  }
}

interface WalletContextType {
  address: string | null;
  balance: string;
  connect: () => Promise<void>;
  disconnect: () => void;
  isConnecting: boolean;
  error: string | null;
}

const WalletContext = createContext<WalletContextType>({
  address: null,
  balance: "0",
  connect: async () => {},
  disconnect: () => {},
  isConnecting: false,
  error: null,
});

export const useWallet = () => useContext(WalletContext);

export function WalletProvider({ children }: { children: ReactNode }) {
  const [address, setAddress] = useState<string | null>(null);
  const [balance, setBalance] = useState("0");
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkConnection = async () => {
      if (typeof window !== "undefined" && window.ethereum) {
        try {
          // Request accounts without using ethers initially
          const accounts = await window.ethereum.request({
            method: "eth_accounts",
          });

          if (accounts.length > 0) {
            // Do fetch api to store data in server
            const response = await fetch(`${api_url}/user`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                public_address: accounts[0],
                display_name: "default",
              }),
            });

            const data = await response.json();
            console.log("Wallet display name added successfully:", data);

            setAddress(accounts[0]);
            // Get balance using eth_getBalance
            const balanceHex = await window.ethereum.request({
              method: "eth_getBalance",
              params: [accounts[0], "latest"],
            });
            // Convert hex balance to decimal and from wei to ether
            const balanceInWei = Number.parseInt(balanceHex, 16).toString();
            const balanceInEther = Number.parseFloat(balanceInWei) / 1e18;
            setBalance(balanceInEther.toString());
          }
        } catch (err) {
          console.error("Failed to check wallet connection:", err);
        }
      }
    };

    checkConnection();
  }, []);

  // Connect wallet
  const connect = async () => {
    setIsConnecting(true);
    setError(null);

    try {
      if (typeof window !== "undefined" && window.ethereum) {
        // Request accounts
        const accounts = await window.ethereum.request({
          method: "eth_requestAccounts",
        });

        if (accounts.length > 0) {
          setAddress(accounts[0]);
          // Get balance
          const balanceHex = await window.ethereum.request({
            method: "eth_getBalance",
            params: [accounts[0], "latest"],
          });
          // Convert hex balance to decimal and from wei to ether
          const balanceInWei = Number.parseInt(balanceHex, 16).toString();
          const balanceInEther = Number.parseFloat(balanceInWei) / 1e18;
          setBalance(balanceInEther.toString());
        }
      } else {
        setError("Please install MetaMask or use a Web3-enabled browser");
      }
    } catch (err: any) {
      setError(err.message || "Failed to connect wallet");
    } finally {
      setIsConnecting(false);
    }
  };

  // Disconnect wallet
  const disconnect = () => {
    setAddress(null);
    setBalance("0");
  };

  // Listen for account changes
  useEffect(() => {
    if (typeof window !== "undefined" && window.ethereum) {
      const handleAccountsChanged = (accounts: string[]) => {
        if (accounts.length === 0) {
          // User disconnected their wallet
          disconnect();
        } else if (accounts[0] !== address) {
          // User switched accounts
          setAddress(accounts[0]);
          // Update balance for new account
          window.ethereum
            .request({
              method: "eth_getBalance",
              params: [accounts[0], "latest"],
            })
            .then((balanceHex: string) => {
              const balanceInWei = Number.parseInt(balanceHex, 16).toString();
              const balanceInEther = Number.parseFloat(balanceInWei) / 1e18;
              setBalance(balanceInEther.toString());
            });
        }
      };

      window.ethereum.on("accountsChanged", handleAccountsChanged);

      return () => {
        if (window.ethereum.removeListener) {
          window.ethereum.removeListener(
            "accountsChanged",
            handleAccountsChanged
          );
        }
      };
    }
  }, [address]);

  return (
    <WalletContext.Provider
      value={{
        address,
        balance,
        connect,
        disconnect,
        isConnecting,
        error,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
}
