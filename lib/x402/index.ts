// x402 Core Library - KISS: Pure functions, no side effects, testable

import {
  type PaymentRequirement,
  type PaymentOption,
  type VerifiedPayment,
  type FacilitatorConfig,
  CHAIN_CONFIG,
  DEFAULT_FACILITATOR,
} from "./types";

/**
 * Convert USD amount to micro-units (1e6)
 * USDC uses 6 decimal places
 */
export function usdToMicroUsd(usd: number | string): string {
  const parsed = typeof usd === "string" ? parseFloat(usd) : usd;
  if (isNaN(parsed) || parsed < 0) {
    throw new Error("Invalid USD amount");
  }
  return Math.round(parsed * 1_000_000).toString();
}

/**
 * Convert micro-units to USD
 */
export function microUsdToUsd(microUsd: string | number): number {
  const parsed = typeof microUsd === "string" ? parseInt(microUsd, 10) : microUsd;
  if (isNaN(parsed)) {
    throw new Error("Invalid micro-USDC amount");
  }
  return parsed / 1_000_000;
}

/**
 * Create a PaymentRequirement object
 * KISS: Single responsibility - just create the requirement
 */
export function createPaymentRequirement(params: {
  url: string;
  amountUsd: number | string;
  recipient: string;
  description?: string;
  chain?: "mainnet" | "sepolia";
  facilitator?: string;
}): PaymentRequirement {
  const {
    url,
    amountUsd,
    recipient,
    description,
    chain = "sepolia",
  } = params;

  if (!/^0x[a-fA-F0-9]{40}$/.test(recipient)) {
    throw new Error("Invalid recipient wallet address");
  }

  const networkConfig = chain === "mainnet"
    ? CHAIN_CONFIG.base.mainnet
    : CHAIN_CONFIG.base.sepolia;

  const option: PaymentOption = {
    scheme: "exact",
    network: networkConfig.chainId,
    amount: usdToMicroUsd(amountUsd),
    asset: "USDC",
    payTo: recipient,
  };

  const expires = Date.now() + 5 * 60 * 1000;

  return {
    x402Version: 2,
    error: "PAYMENT-SIGNATURE header is required",
    resource: {
      url,
      description: description || `Access to ${url}`,
    },
    accepts: [option],
    expires,
  };
}

/**
 * Encode PaymentRequirement to base64 header format
 */
export function encodePaymentRequirement(requirement: PaymentRequirement): string {
  return Buffer.from(JSON.stringify(requirement)).toString("base64");
}

/**
 * Decode base64 header to PaymentRequirement
 */
export function decodePaymentRequirement(encoded: string): PaymentRequirement {
  try {
    const decoded = Buffer.from(encoded, "base64").toString("utf-8");
    const parsed = JSON.parse(decoded);

    if (parsed.x402Version !== 2) {
      throw new Error("Unsupported x402 version");
    }
    if (!parsed.resource?.url || !parsed.accepts?.length) {
      throw new Error("Invalid payment requirement format");
    }

    return parsed as PaymentRequirement;
  } catch {
    throw new Error("Failed to decode payment requirement");
  }
}

/**
 * Check if a PaymentRequirement has expired
 */
export function isRequirementExpired(requirement: PaymentRequirement): boolean {
  return Date.now() > requirement.expires;
}

/**
 * Select the best payment option from a requirement
 */
export function selectPaymentOption(requirement: PaymentRequirement): PaymentOption | null {
  const exactOption = requirement.accepts.find((opt) => opt.scheme === "exact");
  return exactOption || null;
}

/**
 * Calculate platform fee (5%)
 */
export function calculatePlatformFee(amountUsd: number): number {
  return Math.round(amountUsd * 0.05 * 10000) / 10000;
}

/**
 * Calculate seller earnings (95%)
 */
export function calculateSellerEarnings(amountUsd: number): number {
  return Math.round(amountUsd * 0.95 * 10000) / 10000;
}

/**
 * Verify payment with facilitator
 */
export async function verifyPaymentWithFacilitator(
  signature: string,
  requirement: PaymentRequirement,
  facilitatorConfig?: FacilitatorConfig
): Promise<VerifiedPayment> {
  const config = facilitatorConfig || {
    endpoint: DEFAULT_FACILITATOR.endpoint,
    apiKey: DEFAULT_FACILITATOR.apiKey,
  };

  if (!config.apiKey) {
    console.warn("[x402] No facilitator API key configured, skipping verification");
    return {
      valid: true,
      amount: requirement.accepts[0]?.amount || "0",
      payer: "0x0000000000000000000000000000000000000000",
      recipient: requirement.accepts[0]?.payTo || "",
      network: requirement.accepts[0]?.network || "",
    };
  }

  try {
    const response = await fetch(`${config.endpoint}/verify`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${config.apiKey}`,
      },
      body: JSON.stringify({
        signature,
        requirement,
      }),
    });

    if (!response.ok) {
      throw new Error(`Facilitator error: ${response.status}`);
    }

    return (await response.json()) as VerifiedPayment;
  } catch (error) {
    console.error("[x402] Payment verification failed:", error);
    return {
      valid: false,
      amount: "0",
      payer: "",
      recipient: "",
      network: "",
    };
  }
}

/**
 * Settle payment with facilitator
 */
export async function settlePaymentWithFacilitator(
  verifiedData: VerifiedPayment,
  facilitatorConfig?: FacilitatorConfig
): Promise<{ settled: boolean; txHash?: string }> {
  const config = facilitatorConfig || {
    endpoint: DEFAULT_FACILITATOR.endpoint,
    apiKey: DEFAULT_FACILITATOR.apiKey,
  };

  if (!config.apiKey) {
    console.warn("[x402] No facilitator configured, simulating settlement");
    return {
      settled: true,
      txHash: `0x${Math.random().toString(16).slice(2)}`,
    };
  }

  try {
    const response = await fetch(`${config.endpoint}/settle`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${config.apiKey}`,
      },
      body: JSON.stringify(verifiedData),
    });

    if (!response.ok) {
      throw new Error(`Facilitator settlement error: ${response.status}`);
    }

    const result = await response.json();
    return {
      settled: result.settled ?? true,
      txHash: result.txHash,
    };
  } catch (error) {
    console.error("[x402] Payment settlement failed:", error);
    return { settled: false };
  }
}

/**
 * Validate wallet address format
 */
export function isValidEthAddress(address: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
}

/**
 * Validate minimum payout amount
 */
export function isValidPayoutAmount(amountUsd: number, minimumUsd: number = 50): boolean {
  return amountUsd >= minimumUsd;
}

// Re-export types
export type {
  PaymentRequirement,
  PaymentOption,
  VerifiedPayment,
  FacilitatorConfig,
  X402MiddlewareOptions,
} from "./types";
