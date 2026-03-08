// x402 Middleware for Next.js - KISS: Composable, testable middleware

import { NextRequest, NextResponse } from "next/server";
import {
  type PaymentRequirement,
  type X402MiddlewareOptions,
  decodePaymentRequirement,
  isRequirementExpired,
  selectPaymentOption,
  verifyPaymentWithFacilitator,
  isValidEthAddress,
} from "./index";

/**
 * Parse x402 headers from request
 */
function parseX402Headers(req: NextRequest): {
  paymentRequired: string | null;
  paymentSignature: string | null;
} {
  return {
    paymentRequired: req.headers.get("PAYMENT-REQUIRED"),
    paymentSignature: req.headers.get("PAYMENT-SIGNATURE"),
  };
}

/**
 * Create 402 Payment Required response
 */
function create402Response(requirement: PaymentRequirement): NextResponse {
  const encoded = Buffer.from(JSON.stringify(requirement)).toString("base64");

  return new NextResponse(
    JSON.stringify({
      error: requirement.error || "Payment required",
      resource: requirement.resource,
    }),
    {
      status: 402,
      headers: {
        "Content-Type": "application/json",
        "PAYMENT-REQUIRED": encoded,
        "Cache-Control": "no-store",
      },
    }
  );
}

/**
 * x402 middleware wrapper for Next.js API handlers
 *
 * Usage:
 * ```typescript
 * export const GET = x402Middleware(handler, {
 *   price: "0.01",
 *   recipient: "0x...",
 * });
 * ```
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function x402Middleware(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  handler: (req: NextRequest, ...args: any[]) => Promise<NextResponse>,
  options: X402MiddlewareOptions
) {
  const {
    price,
    asset = "USDC",
    chain = "sepolia",
    recipient,
    facilitator,
    description,
  } = options;

  if (!isValidEthAddress(recipient)) {
    throw new Error(`Invalid x402 recipient address: ${recipient}`);
  }

  return async (
    req: NextRequest,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ...args: any[]
  ): Promise<NextResponse> => {
    // Free endpoint - skip payment
    if (price === "0" || parseFloat(price) === 0) {
      return handler(req, ...args);
    }

    const { paymentRequired, paymentSignature } = parseX402Headers(req);
    const url = req.nextUrl.href;

    // Case 1: No payment info - return 402 with payment requirement
    if (!paymentSignature) {
      const requirement = {
        x402Version: 2 as const,
        error: "Payment required",
        resource: {
          url,
          description: description || `Access to ${req.nextUrl.pathname}`,
        },
        accepts: [
          {
            scheme: "exact" as const,
            network: chain === "mainnet" ? "eip155:8453" : "eip155:84532",
            amount: Math.round(parseFloat(price) * 1_000_000).toString(),
            asset,
            payTo: recipient,
          },
        ],
        expires: Date.now() + 5 * 60 * 1000,
      };

      return create402Response(requirement);
    }

    // Case 2: Has payment signature - verify it
    try {
      let requirement: PaymentRequirement;

      if (paymentRequired) {
        requirement = decodePaymentRequirement(paymentRequired);

        // Check expiration
        if (isRequirementExpired(requirement)) {
          return create402Response({
            ...requirement,
            error: "Payment requirement expired",
          });
        }

        // Verify recipient matches
        const option = selectPaymentOption(requirement);
        if (option && option.payTo !== recipient) {
          return NextResponse.json(
            { error: "Recipient address mismatch" },
            { status: 400 }
          );
        }
      } else {
        // Reconstruct requirement from options if header missing
        requirement = {
          x402Version: 2,
          resource: { url, description: description || req.nextUrl.pathname },
          accepts: [
            {
              scheme: "exact",
              network: chain === "mainnet" ? "eip155:8453" : "eip155:84532",
              amount: Math.round(parseFloat(price) * 1_000_000).toString(),
              asset,
              payTo: recipient,
            },
          ],
          expires: Date.now() + 5 * 60 * 1000,
        };
      }

      // Verify payment signature
      const verified = await verifyPaymentWithFacilitator(
        paymentSignature,
        requirement,
        facilitator
      );

      if (!verified.valid) {
        return NextResponse.json(
          { error: "Invalid payment signature" },
          { status: 402 }
        );
      }

      // Execute handler and attach payment info
      const response = await handler(req, ...args);

      // Add payment response header to successful responses
      if (response.ok) {
        const paymentTxHash =
          verified.txHash || `0x${Math.random().toString(16).slice(2)}`;
        const paymentResponse = Buffer.from(
          JSON.stringify({
            txHash: paymentTxHash,
            amount: verified.amount,
            payer: verified.payer,
          })
        ).toString("base64");
        response.headers.set("PAYMENT-RESPONSE", paymentResponse);
      }

      return response;
    } catch (error) {
      console.error("[x402] Middleware error:", error);
      return NextResponse.json(
        { error: "Payment processing failed" },
        { status: 500 }
      );
    }
  };
}

/**
 * Helper to extract payment response from response headers
 */
export function extractPaymentResponse(response: Response): {
  txHash?: string;
  amount?: string;
  payer?: string;
} | null {
  const paymentResponse = response.headers.get("PAYMENT-RESPONSE");
  if (!paymentResponse) return null;

  try {
    return JSON.parse(
      Buffer.from(paymentResponse, "base64").toString("utf-8")
    );
  } catch {
    return null;
  }
}
