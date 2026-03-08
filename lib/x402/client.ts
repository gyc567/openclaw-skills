// x402 Client SDK - KISS: Simple, minimal client-side payment handling

import { type PaymentRequirement, decodePaymentRequirement } from "./index";

/**
 * x402 Client for making payments
 * Handles 402 responses and automatic retry with payment
 */
export class X402Client {
  private payerAddress: string | null = null;
  private privateKey: string | null = null;

  /**
   * Set the payer wallet
   */
  setPayer(address: string): void {
    if (!/^0x[a-fA-F0-9]{40}$/.test(address)) {
      throw new Error("Invalid wallet address");
    }
    this.payerAddress = address;
  }

  /**
   * Get current payer address
   */
  getPayer(): string | null {
    return this.payerAddress;
  }

  /**
   * Check if wallet is connected
   */
  isConnected(): boolean {
    return this.payerAddress !== null;
  }

  /**
   * Connect to browser wallet (MetaMask, Coinbase Wallet, etc.)
   */
  async connectWallet(): Promise<string | null> {
    if (typeof window === "undefined" || !window.ethereum) {
      console.warn("[x402] No Ethereum provider found");
      return null;
    }

    try {
      const accounts = await window.ethereum!.request({
        method: "eth_requestAccounts",
      }) as string[];

      if (accounts.length > 0) {
        this.payerAddress = accounts[0];
        return this.payerAddress;
      }
      return null;
    } catch (error) {
      console.error("[x402] Failed to connect wallet:", error);
      return null;
    }
  }

  /**
   * Disconnect wallet
   */
  disconnectWallet(): void {
    this.payerAddress = null;
    this.privateKey = null;
  }

  /**
   * Sign a payment authorization using EIP-3009
   * This creates a gasless USDC transfer authorization
   */
  async signPayment(requirement: PaymentRequirement): Promise<string> {
    if (!this.payerAddress) {
      throw new Error("Wallet not connected");
    }

    const message = this.buildAuthorizationMessage(requirement);

    try {
      const signature = await window.ethereum!.request({
        method: "personal_sign",
        params: [message, this.payerAddress],
      }) as string;

      return signature;
    } catch (error) {
      console.error("[x402] Failed to sign payment:", error);
      throw new Error("Payment signing failed");
    }
  }

  /**
   * Build authorization message for EIP-3009 transfer with authorization
   */
  private buildAuthorizationMessage(requirement: PaymentRequirement): string {
    const option = requirement.accepts[0];
    if (!option) {
      throw new Error("No valid payment option");
    }

    const domain = {
      name: "USDC",
      version: "2",
      chainId: option.network.startsWith("eip155:")
        ? parseInt(option.network.split(":")[1], 10)
        : 8453,
      verifyingContract: option.asset === "USDC" ? option.payTo : "0x0000000000000000000000000000000000000000",
    };

    const message = {
      from: this.payerAddress,
      to: option.payTo,
      value: "0",
      data: "0x",
      validAfter: "0",
      validBefore: Math.floor(requirement.expires / 1000).toString(),
      nonce: Date.now().toString(16),
    };

    return [
      "OpenClaw Payment Authorization",
      `Amount: ${(parseInt(option.amount) / 1_000_000).toFixed(6)} USDC`,
      `To: ${option.payTo}`,
      `Expires: ${new Date(requirement.expires).toISOString()}`,
      `Domain: ${domain.verifyingContract}`,
    ].join("\n");
  }

  /**
   * Make a request with automatic x402 handling
   * If 402 is returned, it will sign and retry automatically
   */
  async fetch(url: string, options: RequestInit = {}): Promise<Response> {
    const response = await fetch(url, options);

    if (response.status !== 402) {
      return response;
    }

    const paymentRequired = response.headers.get("PAYMENT-REQUIRED");
    if (!paymentRequired) {
      return response;
    }

    try {
      const requirement = decodePaymentRequirement(paymentRequired);

      if (!this.payerAddress) {
        console.warn("[x402] Payment required but wallet not connected");
        return response;
      }

      const signature = await this.signPayment(requirement);

      return fetch(url, {
        ...options,
        headers: {
          ...options.headers,
          "PAYMENT-SIGNATURE": signature,
        },
      });
    } catch (error) {
      console.error("[x402] Failed to handle 402:", error);
      return response;
    }
  }

  /**
   * Parse payment response from headers
   */
  static parsePaymentResponse(headers: Headers): {
    txHash?: string;
    amount?: string;
    payer?: string;
  } | null {
    const paymentResponse = headers.get("PAYMENT-RESPONSE");
    if (!paymentResponse) return null;

    try {
      return JSON.parse(atob(paymentResponse));
    } catch {
      return null;
    }
  }
}

/**
 * Singleton instance for easy import
 */
export const x402Client = new X402Client();

/**
 * Convenience function for one-off payments
 */
export async function x402Fetch(
  url: string,
  options: RequestInit & { autoPay?: boolean } = {}
): Promise<Response> {
  const { autoPay = true, ...fetchOptions } = options;

  if (!autoPay) {
    return fetch(url, fetchOptions);
  }

  return x402Client.fetch(url, fetchOptions);
}

/**
 * Check if browser has a compatible wallet
 */
export function hasWalletProvider(): boolean {
  if (typeof window === "undefined") return false;
  return !!window.ethereum;
}

/**
 * Get list of supported wallet types
 */
export function getSupportedWallets(): string[] {
  const wallets: string[] = [];

  if (typeof window !== "undefined" && window.ethereum) {
    const ethereum = window.ethereum as {
      isMetaMask?: boolean;
      isCoinbaseWallet?: boolean;
      isRabby?: boolean;
    };

    if (ethereum.isMetaMask) wallets.push("MetaMask");
    if (ethereum.isCoinbaseWallet) wallets.push("Coinbase Wallet");
    if (ethereum.isRabby) wallets.push("Rabby");
  }

  return wallets;
}

declare global {
  interface Window {
    ethereum?: {
      isMetaMask?: boolean;
      isCoinbaseWallet?: boolean;
      isRabby?: boolean;
      request(args: {
        method: string;
        params?: unknown[];
      }): Promise<unknown>;
    };
  }
}

export default X402Client;
