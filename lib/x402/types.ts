// x402 Protocol Types - KISS: Minimal, focused types

/**
 * x402 V2 Payment Requirement
 * @see https://x402.org
 */
export interface PaymentRequirement {
  x402Version: 2;
  error?: string;
  resource: {
    url: string;
    description?: string;
  };
  accepts: PaymentOption[];
  expires: number;
}

/** Single payment option accepted by the server */
export interface PaymentOption {
  scheme: "exact" | "deferred";
  network: string; // e.g., "eip155:84532" for Base Mainnet
  amount: string; // in micro-units (micro-USDC)
  asset: string; // e.g., "USDC"
  payTo: string; // recipient wallet address
  expires?: number;
}

/** Payment signature from client */
export interface PaymentSignature {
  signature: string;
  requirement: PaymentRequirement;
}

/** Verified payment result */
export interface VerifiedPayment {
  valid: boolean;
  txHash?: string;
  amount: string;
  payer: string;
  recipient: string;
  network: string;
}

/** Payment response from server */
export interface PaymentResponse {
  success: boolean;
  txHash?: string;
  message?: string;
}

/** Payment status enum */
export type PaymentStatus = "pending" | "settled" | "failed";

/** x402 session for tracking payment flow */
export interface X402Session {
  id: number;
  sessionId: string;
  listingId: number;
  buyerWallet: string;
  amountUsd: number;
  expiresAt: Date;
  status: "active" | "used" | "expired";
  createdAt: Date;
}

/** Transaction record */
export interface Transaction {
  id: number;
  listingId: number;
  buyerWallet: string;
  sellerAgentId: number;
  amountUsd: number;
  amountRaw: string;
  txHash: string | null;
  status: PaymentStatus;
  facilitator: string | null;
  platformFee: number;
  createdAt: Date;
  settledAt: Date | null;
}

/** Purchase record */
export interface Purchase {
  id: number;
  listingId: number;
  buyerId: number | null;
  buyerWallet: string;
  transactionId: number | null;
  amountUsd: number;
  purchasedAt: Date;
}

/** Refund record */
export interface Refund {
  id: number;
  transactionId: number;
  buyerId: number | null;
  amountUsd: number;
  reason: string | null;
  status: "pending" | "approved" | "rejected" | "processed";
  requestedAt: Date;
  processedAt: Date | null;
}

/** Payout record */
export interface Payout {
  id: number;
  agentId: number;
  amountUsd: number;
  feeUsd: number;
  status: "pending" | "processing" | "completed" | "failed";
  walletAddress: string;
  txHash: string | null;
  requestedAt: Date;
  processedAt: Date | null;
}

/** Wallet record */
export interface Wallet {
  id: number;
  agentId: number;
  address: string;
  chain: string;
  isVerified: boolean;
  createdAt: Date;
}

/** Listing/Skill for sale */
export interface Listing {
  id: number;
  agentId: number;
  type: "skill" | "persona" | "template";
  name: string;
  description: string | null;
  category: string | null;
  priceUsd: number;
  isPublished: boolean;
  version: string;
  packageUrl: string | null;
  createdAt: Date;
  updatedAt: Date;
}

/** Facilitator configuration */
export interface FacilitatorConfig {
  endpoint: string;
  apiKey: string;
}

/** x402 middleware options */
export interface X402MiddlewareOptions {
  price: string; // in USD
  asset?: string;
  chain?: string;
  recipient: string;
  facilitator?: FacilitatorConfig;
  description?: string;
}

/** Chain configuration */
export const CHAIN_CONFIG = {
  base: {
    mainnet: {
      chainId: "eip155:8453",
      name: "Base Mainnet",
      usdcAddress: "0x833589fCD6e3B9d7c4f7aC5fF7a2d4a3fF7eF8aB", // USDC on Base
    },
    sepolia: {
      chainId: "eip155:84532",
      name: "Base Sepolia (Testnet)",
      usdcAddress: "0x036CbD5d3fA8e5C8E3cB2d5cB3A6F8eD7C6dE5F4", // USDC on Base Sepolia
    },
  },
} as const;

/** Default facilitator endpoints (configurable via env) */
export const DEFAULT_FACILITATOR = {
  endpoint: process.env.FACILITATOR_URL || "https://facilitator.payai.io",
  apiKey: process.env.FACILITATOR_API_KEY || "",
} as const;

/** Minimum payout amount in USD */
export const MINIMUM_PAYOUT_USD = 50;

/** Platform fee percentage (5%) */
export const PLATFORM_FEE_PERCENT = 5;

/** Refund window in milliseconds (7 days) */
export const REFUND_WINDOW_MS = 7 * 24 * 60 * 60 * 1000;
