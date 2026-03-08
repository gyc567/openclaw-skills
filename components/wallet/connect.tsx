// Wallet Connection Component
// "use client" - Client-side wallet connection

"use client";

import { useState, useCallback } from "react";
import { Wallet, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { x402Client, hasWalletProvider, getSupportedWallets } from "@/lib/x402";

interface WalletConnectProps {
  agentId?: number;
  onConnect?: (address: string) => void;
  onDisconnect?: () => void;
}

export function WalletConnect({ agentId, onConnect, onDisconnect }: WalletConnectProps) {
  const [address, setAddress] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isVerified, setIsVerified] = useState(false);

  const wallets = getSupportedWallets();

  const handleConnect = useCallback(async () => {
    setIsConnecting(true);
    setError(null);

    try {
      // Check if wallet provider exists
      if (!hasWalletProvider()) {
        setError("No wallet detected. Please install MetaMask or Coinbase Wallet.");
        setIsConnecting(false);
        return;
      }

      // Connect wallet
      const connectedAddress = await x402Client.connectWallet();

      if (connectedAddress) {
        setAddress(connectedAddress);
        onConnect?.(connectedAddress);

        // If agentId provided, register wallet
        if (agentId) {
          await registerWallet(connectedAddress);
        }
      } else {
        setError("Failed to connect wallet. Please try again.");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Connection failed");
    } finally {
      setIsConnecting(false);
    }
  }, [agentId, onConnect]);

  const handleDisconnect = useCallback(() => {
    x402Client.disconnectWallet();
    setAddress(null);
    setIsVerified(false);
    onDisconnect?.();
  }, [onDisconnect]);

  const registerWallet = async (walletAddress: string) => {
    try {
      const response = await fetch("/api/wallet", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          agentId,
          address: walletAddress,
          chain: "base",
        }),
      });

      const data = await response.json();
      if (data.success) {
        setIsVerified(data.wallet?.isVerified || false);
      }
    } catch (err) {
      console.error("Failed to register wallet:", err);
    }
  };

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  if (address) {
    return (
      <Card className="bg-card border-border">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Wallet className="w-4 h-4 text-accent" />
            Wallet Connected
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <code className="text-sm font-mono bg-secondary px-2 py-1 rounded">
                {formatAddress(address)}
              </code>
              {isVerified ? (
                <Badge variant="secondary" className="bg-green-500/10 text-green-400">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Verified
                </Badge>
              ) : (
                <Badge variant="secondary" className="bg-yellow-500/10 text-yellow-400">
                  <AlertCircle className="w-3 h-3 mr-1" />
                  Unverified
                </Badge>
              )}
            </div>
            <Button
              variant="outline"
              size="sm"
              className="w-full"
              onClick={handleDisconnect}
            >
              Disconnect
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <Wallet className="w-4 h-4" />
          Connect Wallet
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {wallets.length > 0 && (
            <div className="text-xs text-muted-foreground">
              Detected: {wallets.join(", ")}
            </div>
          )}
          
          {error && (
            <div className="text-xs text-red-400 bg-red-500/10 p-2 rounded">
              {error}
            </div>
          )}

          <Button
            className="w-full"
            onClick={handleConnect}
            disabled={isConnecting}
          >
            {isConnecting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Connecting...
              </>
            ) : (
              <>
                <Wallet className="w-4 h-4 mr-2" />
                Connect Wallet
              </>
            )}
          </Button>

          {wallets.length === 0 && (
            <p className="text-xs text-muted-foreground text-center">
              Install MetaMask or Coinbase Wallet to connect
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default WalletConnect;
