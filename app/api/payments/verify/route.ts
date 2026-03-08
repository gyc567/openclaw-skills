// Payments API Routes
// POST /api/payments/verify - Verify payment signature
// POST /api/payments/settle - Settle completed payment

import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db/client";
import {
  decodePaymentRequirement,
  verifyPaymentWithFacilitator,
  settlePaymentWithFacilitator,
  calculatePlatformFee,
  calculateSellerEarnings,
} from "@/lib/x402";

interface TransactionRow {
  id: number;
  listing_id: number;
  buyer_wallet: string;
  seller_agent_id: number;
  amount_usd: number;
  amount_raw: string;
  tx_hash: string | null;
  status: string;
  facilitator: string | null;
  platform_fee: number;
  created_at: Date;
  settled_at: Date | null;
}

/**
 * POST /api/payments/verify - Verify payment signature
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { signature, paymentRequirement: paymentRequirementEncoded, listingId, buyerWallet } = body;

    if (!signature || !paymentRequirementEncoded || !listingId || !buyerWallet) {
      return NextResponse.json(
        { success: false, error: "signature, paymentRequirement, listingId, and buyerWallet are required" },
        { status: 400 }
      );
    }

    // Decode payment requirement
    let paymentRequirement;
    try {
      paymentRequirement = decodePaymentRequirement(paymentRequirementEncoded);
    } catch {
      return NextResponse.json(
        { success: false, error: "Invalid payment requirement format" },
        { status: 400 }
      );
    }

    // Get listing info
    const listings = await query<{
      id: number;
      agent_id: number;
      price_usd: number;
      name: string;
    }>("SELECT id, agent_id, price_usd, name FROM listings WHERE id = $1", [listingId]);

    if (listings.length === 0) {
      return NextResponse.json(
        { success: false, error: "Listing not found" },
        { status: 404 }
      );
    }

    const listing = listings[0];

    // Verify payment with facilitator
    const verified = await verifyPaymentWithFacilitator(signature, paymentRequirement);

    if (!verified.valid) {
      return NextResponse.json(
        { success: false, error: "Payment verification failed" },
        { status: 402 }
      );
    }

    // Calculate fees
    const platformFee = calculatePlatformFee(listing.price_usd);
    const sellerEarnings = calculateSellerEarnings(listing.price_usd);

    // Create transaction record
    const transactions = await query<TransactionRow>(
      `INSERT INTO transactions (
        listing_id, buyer_wallet, seller_agent_id,
        amount_usd, amount_raw, tx_hash,
        status, facilitator, platform_fee
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *`,
      [
        listingId,
        buyerWallet,
        listing.agent_id,
        listing.price_usd,
        verified.amount,
        verified.txHash || null,
        "settled",
        "facilitator",
        platformFee,
      ]
    );

    const transaction = transactions[0];

    return NextResponse.json({
      success: true,
      transaction: {
        id: transaction.id,
        listingId: transaction.listing_id,
        buyerWallet: transaction.buyer_wallet,
        sellerAgentId: transaction.seller_agent_id,
        amountUsd: transaction.amount_usd,
        txHash: transaction.tx_hash,
        status: transaction.status,
        platformFee: transaction.platform_fee,
        sellerEarnings,
        createdAt: transaction.created_at,
      },
    });
  } catch (error) {
    console.error("Payment verification error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to verify payment" },
      { status: 500 }
    );
  }
}
