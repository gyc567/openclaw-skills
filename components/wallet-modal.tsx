"use client";

import { useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { SUPPORTED_WALLETS, useWallet, WalletInfo } from "@/lib/wallet";

interface WalletModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function WalletModal({ open, onOpenChange }: WalletModalProps) {
  const { error, refreshWallets, wallets, isConnecting, address } = useWallet();

  useEffect(() => {
    if (open) {
      refreshWallets();
    }
  }, [open, refreshWallets]);

  const detectedWallets = wallets.filter((w) => w.detected);
  const undetectedWallets = wallets.filter((w) => !w.detected);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <button
          onClick={() => onOpenChange(false)}
          className="absolute right-4 top-4 p-1 rounded-md hover:bg-secondary transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
        <DialogHeader>
          <DialogTitle className="font-mono">Connect Wallet</DialogTitle>
          <DialogDescription className="font-mono">
            {address ? `Connected: ${address.slice(0, 6)}...${address.slice(-4)}` : "Select a wallet to connect to OpenCreditAi"}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {isConnecting && (
            <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-md">
              <p className="text-sm text-blue-400 font-mono animate-pulse">⏳ Waiting for wallet approval...</p>
              <p className="text-xs text-muted-foreground font-mono mt-1">Please check MetaMask popup and approve connection</p>
            </div>
          )}

          <div className="p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-md">
            <p className="text-xs text-yellow-400 font-mono mb-2">🔧 Debug Info:</p>
            <p className="text-xs text-muted-foreground font-mono">window.ethereum: {typeof window !== 'undefined' ? (window as any).ethereum ? 'EXISTS' : 'NOT FOUND' : 'SSR'}</p>
            <p className="text-xs text-muted-foreground font-mono">isMetaMask: {typeof window !== 'undefined' ? (window as any).ethereum?.isMetaMask : 'N/A'}</p>
            <p className="text-xs text-muted-foreground font-mono">Connected: {address ? 'YES' : 'NO'}</p>
            <p className="text-xs text-muted-foreground font-mono">Error: {error || 'none'}</p>
          </div>

          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-md">
              <p className="text-sm text-red-400 font-mono">{error}</p>
            </div>
          )}

          {detectedWallets.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground font-mono uppercase">
                Detected
              </p>
              {detectedWallets.map((wallet) => (
                <WalletOption key={wallet.id} wallet={wallet} onSelect={() => onOpenChange(false)} />
              ))}
            </div>
          )}

          {undetectedWallets.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground font-mono uppercase">
                Available
              </p>
              {undetectedWallets.map((wallet) => (
                <WalletOption key={wallet.id} wallet={wallet} onSelect={() => onOpenChange(false)} />
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function WalletOption({ wallet, onSelect }: { wallet: WalletInfo; onSelect: () => void }) {
  const { connect, isConnecting, error } = useWallet();

  const handleClick = async () => {
    console.log("[WalletModal Debug] Wallet clicked:", wallet.name, "detected:", wallet.detected, "isConnecting:", isConnecting);
    if (wallet.detected) {
      console.log("[WalletModal Debug] Calling connect()...");
      try {
        await connect();
        console.log("[WalletModal Debug] connect() completed");
      } catch (e) {
        console.error("[WalletModal Debug] connect() error:", e);
      }
      console.log("[WalletModal Debug] About to call onSelect()");
      onSelect();
    } else {
      console.log("[WalletModal Debug] Opening install URL:", wallet.installUrl);
      window.open(wallet.installUrl, "_blank");
    }
  };

  const isThisWalletConnecting = isConnecting;

  return (
    <button
      onClick={handleClick}
      disabled={isThisWalletConnecting}
      className="w-full flex items-center justify-between p-3 bg-secondary border border-border rounded-md hover:border-accent transition-colors disabled:opacity-50"
    >
      <div className="flex items-center gap-3">
        <span className="text-2xl">{wallet.icon}</span>
        <span className="font-mono">{wallet.name}</span>
      </div>
      {!wallet.detected && (
        <span className="text-xs text-muted-foreground font-mono">Install</span>
      )}
      {wallet.detected && isThisWalletConnecting && (
        <span className="text-xs text-accent font-mono animate-pulse">Connecting...</span>
      )}
    </button>
  );
}
