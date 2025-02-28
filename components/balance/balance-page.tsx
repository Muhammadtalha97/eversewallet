"use client";

import { useEffect, useState } from "react";
import { ArrowLeft, Plus, ArrowUp, RefreshCw, Wallet } from "lucide-react";
import Image from "next/image";
import { motion } from "framer-motion";
import { tonConnector } from "@/lib/ton-connector";
import { toast } from "sonner";

interface BalancePageProps {
  onBack: () => void;
  totalBalance: number;
}

export function BalancePage({ onBack, totalBalance }: BalancePageProps) {
  const [isWalletConnected, setIsWalletConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isTelegramApp, setIsTelegramApp] = useState(false);

  useEffect(() => {
    setIsTelegramApp(Boolean((window as any)?.Telegram?.WebApp));

    const connectionState = tonConnector.getConnectionState();
    setIsWalletConnected(connectionState.connected);
    setWalletAddress(connectionState.address);

    if (connectionState.error) {
      toast.error(connectionState.error);
    }
  }, []);

  const handleConnectWallet = async () => {
    if (!isTelegramApp) {
      toast.error("Wallet connection is only available in Telegram app");
      return;
    }
    if (isWalletConnected) {
      try {
        await tonConnector.disconnect();
        setIsWalletConnected(false);
        setWalletAddress(null);
        toast.success("Wallet disconnected");
      } catch (error) {
        toast.error("Failed to disconnect wallet");
      }
      return;
    }

    setIsConnecting(true);
    try {
      await tonConnector.connect();
      await new Promise((resolve) => setTimeout(resolve, 300)); // Temporary fix
      const connectionState = tonConnector.getConnectionState();
      await tonConnector.connect();
      console.log("Connection State:", connectionState); // Add this line
      setIsWalletConnected(connectionState.connected);
      setWalletAddress(connectionState.address);

      if (connectionState.error) {
        toast.error(connectionState.error);
      } else if (connectionState.connected) {
        toast.success("Wallet connected successfully");
      }
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to connect wallet"
      );
    } finally {
      setIsConnecting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="mb-6 flex items-center">
        <button onClick={onBack} className="text-gray-600">
          <ArrowLeft className="h-6 w-6" />
        </button>
      </div>

      <div className="rounded-xl bg-white p-6 shadow-sm">
        <h2 className="mb-2 text-center text-gray-600">Total balance</h2>
        <div className="mb-6 text-center text-2xl ">
          {totalBalance.toFixed(2)} ERVE points
        </div>

        <div className="grid grid-cols-4 gap-4">
          {[
            { icon: Plus, label: "Deposit" },
            { icon: ArrowUp, label: "Send" },
            { icon: RefreshCw, label: "Swap" },
            { icon: Wallet, label: "Wallet" },
          ].map((item, index) => (
            <motion.button
              key={index}
              whileTap={{ scale: 0.95 }}
              className="flex flex-col items-center space-y-2"
            >
              <div className="rounded-full bg-gray-100 p-3">
                <item.icon className="h-6 w-6 text-gray-700" />
              </div>
              <span className="text-sm text-gray-600">{item.label}</span>
            </motion.button>
          ))}
        </div>
      </div>

      <div className="mt-6 rounded-xl bg-white p-6 shadow-sm">
        <div className="mb-4 flex justify-between text-sm text-gray-600">
          <span>ERVE</span>
          <span>Amount</span>
        </div>
        <div className="flex items-center justify-between rounded-lg bg-gray-50 p-4">
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 rounded-full bg-[#25D366]" />
            <div>
              <div className="font-medium">ERVE points</div>
              <div className="text-sm text-gray-500">on ERVERSE</div>
            </div>
          </div>
          <div className="text-right">
            <div className="font-medium">{totalBalance.toFixed(2)}</div>
            <div className="text-sm text-gray-500">
              ${(totalBalance * 0.1).toFixed(2)}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 rounded-xl bg-[#0B1426] p-6 shadow-sm">
        <div className="flex flex-col items-center justify-center">
          <Image
            src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Screenshot%202025-01-26%20151607-TvyjKqAJG8rd0SHG4SIFFiVyAOIf4T.png"
            alt="TON Wallet"
            width={80}
            height={80}
            className="mb-4"
          />
          <h3 className="mb-2 text-xl font-semibold text-white">Wallet</h3>
          <p className="mb-6 text-center text-sm text-gray-400">
            {isTelegramApp
              ? "Connect your Telegram Wallet for rewards"
              : "Connect TON wallet for future rewards"}
          </p>
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={handleConnectWallet}
            disabled={isConnecting}
            className={`w-full rounded-lg px-6 py-3 font-medium text-white transition-colors ${
              isConnecting
                ? "bg-gray-500 cursor-not-allowed"
                : isWalletConnected
                ? "bg-red-500 hover:bg-red-600"
                : "bg-[#0088CC] hover:bg-[#0077B5]"
            }`}
          >
            {isConnecting
              ? "Connecting..."
              : isWalletConnected
              ? "Disconnect Wallet"
              : "Connect Wallet"}
          </motion.button>
          {walletAddress && (
            <p className="mt-2 text-xs text-gray-400">
              Connected: {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
            </p>
          )}
        </div>
      </div>

      <div className="mt-6 rounded-xl bg-white p-6 shadow-sm">
        <h3 className="mb-4 text-gray-600">Transaction history</h3>
        <div className="text-center text-sm text-gray-500">
          Your transaction history will appear here.
        </div>
      </div>
    </div>
  );
}
