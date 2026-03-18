"use client";

import { useState, useEffect, useCallback } from "react";

export const BASE_CHAIN_ID = "0x2105";
export const BASE_SEPOLIA_CHAIN_ID = "0x14a34";

export const USDC_CONTRACT_BASE = "0x833589fCD6eDb6E08f4c7C32D4d71eBal55E11e9";

export interface WalletState {
  address: string | null;
  chainId: string | null;
  balance: string;
  isConnected: boolean;
  isConnecting: boolean;
  error: string | null;
}

export interface WalletInfo {
  id: string;
  name: string;
  icon: string;
  detected: boolean;
  installUrl: string;
}

export const SUPPORTED_WALLETS: WalletInfo[] = [
  {
    id: "metamask",
    name: "MetaMask",
    icon: "🦊",
    detected: false,
    installUrl: "https://metamask.io/download/",
  },
  {
    id: "coinbase",
    name: "Coinbase Wallet",
    icon: "🔵",
    detected: false,
    installUrl: "https://www.coinbase.com/wallet",
  },
  {
    id: "rabby",
    name: "Rabby",
    icon: "🐰",
    detected: false,
    installUrl: "https://rabby.io/",
  },
  {
    id: "rainbow",
    name: "Rainbow",
    icon: "🌈",
    detected: false,
    installUrl: "https://rainbow.me/",
  },
  {
    id: "trust",
    name: "Trust Wallet",
    icon: "🟢",
    detected: false,
    installUrl: "https://trustwallet.com/",
  },
  {
    id: "bitget",
    name: "BitGet Wallet",
    icon: "🟣",
    detected: false,
    installUrl: "https://web3.bitget.com/en/",
  },
];

function getEthereum() {
  if (typeof window === "undefined") {
    console.log("[Wallet Debug] window is undefined (SSR)");
    return null;
  }
  const eth = (window as unknown as { ethereum?: unknown }).ethereum || null;
  console.log("[Wallet Debug] window.ethereum exists:", !!eth);
  return eth;
}

function detectWallets(): WalletInfo[] {
  const eth = getEthereum();
  if (!eth) {
    console.log("[Wallet Debug] No ethereum provider detected");
    return SUPPORTED_WALLETS.map((w) => ({ ...w, detected: false }));
  }

  const provider = eth as Record<string, unknown>;
  console.log("[Wallet Debug] Ethereum provider properties:", Object.keys(provider));
  console.log("[Wallet Debug] isMetaMask:", provider.isMetaMask);
  console.log("[Wallet Debug] isCoinbaseWallet:", provider.isCoinbaseWallet);

  return SUPPORTED_WALLETS.map((wallet) => {
    let detected = false;

    switch (wallet.id) {
      case "metamask":
        detected = !!provider.isMetaMask && !provider.isCoinbaseWallet;
        break;
      case "coinbase":
        detected = !!provider.isCoinbaseWallet;
        break;
      case "rabby":
        detected = !!provider.isRabby;
        break;
      case "rainbow":
        detected = !!provider.isRainbow;
        break;
      case "trust":
        detected = !!provider.isTrustWallet;
        break;
      case "bitget":
        detected = !!provider.isBitKeep;
        break;
    }

    console.log(`[Wallet Debug] ${wallet.name} detected:`, detected);
    return { ...wallet, detected };
  });
}

async function switchToBase(): Promise<boolean> {
  const eth = getEthereum();
  if (!eth) return false;

  try {
    await (eth as { request: (args: { method: string; params?: unknown[] }) => Promise<unknown> }).request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: BASE_CHAIN_ID }],
    });
    return true;
  } catch {
    return false;
  }
}

async function getBalance(address: string): Promise<string> {
  const eth = getEthereum();
  if (!eth) return "0";

  try {
    const response = await (eth as { request: (args: { method: string; params?: unknown[] }) => Promise<unknown> }).request({
      method: "eth_call",
      params: [
        {
          to: USDC_CONTRACT_BASE,
          data: `0x70a08231000000000000000000000000${address.slice(2).padStart(64, "0")}`,
        },
        "latest",
      ],
    });

    if (response && typeof response === "string" && response !== "0x") {
      const balance = parseInt(response, 16);
      return (balance / 1_000_000).toFixed(2);
    }
    return "0.00";
  } catch {
    console.warn("[Wallet] Failed to fetch USDC balance");
    return "0";
  }
}

export function useWallet() {
  const [state, setState] = useState<WalletState>({
    address: null,
    chainId: null,
    balance: "0",
    isConnected: false,
    isConnecting: false,
    error: null,
  });
  const [wallets, setWallets] = useState<WalletInfo[]>([]);
  const [mounted, setMounted] = useState(false);

  const refreshWallets = useCallback(() => {
    setWallets(detectWallets());
  }, []);

  const connect = useCallback(async () => {
    const eth = getEthereum();
    console.log("[Wallet Debug] connect() called, eth:", !!eth);
    if (!eth) {
      console.log("[Wallet Debug] No eth provider in connect()");
      setState((prev) => ({ ...prev, error: "No wallet detected" }));
      return;
    }

    setState((prev) => ({ ...prev, isConnecting: true, error: null }));

    try {
      const ethereum = eth as { request: (args: { method: string; params?: unknown[] }) => Promise<unknown> };
      const accounts = (await ethereum.request({ method: "eth_requestAccounts" })) as string[];

      if (accounts.length === 0) {
        throw new Error("No accounts found");
      }

      const address = accounts[0];
      const chainId = (await ethereum.request({ method: "eth_chainId" })) as string;

      let targetChainId = chainId;
      let networkError: string | null = null;
      
      if (chainId !== BASE_CHAIN_ID && chainId !== BASE_SEPOLIA_CHAIN_ID) {
        const switched = await switchToBase();
        if (switched) {
          targetChainId = BASE_CHAIN_ID;
        } else {
          networkError = "Please switch to Base network";
        }
      }

      const balance = await getBalance(address);

      setState({
        address,
        chainId: targetChainId,
        balance,
        isConnected: true,
        isConnecting: false,
        error: networkError,
      });
    } catch (err) {
      const error = err instanceof Error ? err.message : "Connection failed";
      setState((prev) => ({
        ...prev,
        isConnecting: false,
        error,
      }));
    }
  }, []);

  const disconnect = useCallback(() => {
    setState({
      address: null,
      chainId: null,
      balance: "0",
      isConnected: false,
      isConnecting: false,
      error: null,
    });
  }, []);

  const switchNetwork = useCallback(async () => {
    const success = await switchToBase();
    if (success && state.address) {
      const balance = await getBalance(state.address);
      setState((prev) => ({
        ...prev,
        chainId: BASE_CHAIN_ID,
        balance,
        error: null,
      }));
    }
  }, [state.address]);

  useEffect(() => {
    setMounted(true);
    refreshWallets();

    const eth = getEthereum();
    if (!eth) return;

    const handleAccountsChanged = (accounts: unknown) => {
      const accs = accounts as string[];
      if (accs.length === 0) {
        disconnect();
      } else {
        connect();
      }
    };

    const handleChainChanged = () => {
      window.location.reload();
    };

    const provider = eth as { on: (event: string, cb: (...args: unknown[]) => void) => void; removeListener: (event: string, cb: (...args: unknown[]) => void) => void };
    provider.on("accountsChanged", handleAccountsChanged);
    provider.on("chainChanged", handleChainChanged);

    return () => {
      provider.removeListener("accountsChanged", handleAccountsChanged);
      provider.removeListener("chainChanged", handleChainChanged);
    };
  }, [connect, disconnect, refreshWallets]);

  return {
    ...state,
    wallets: mounted ? wallets : SUPPORTED_WALLETS,
    connect,
    disconnect,
    switchNetwork,
    refreshWallets,
    isWrongNetwork: state.chainId !== BASE_CHAIN_ID && state.chainId !== BASE_SEPOLIA_CHAIN_ID && state.chainId !== null,
  };
}
