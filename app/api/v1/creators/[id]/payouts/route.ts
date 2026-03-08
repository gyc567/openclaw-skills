// Creator Payouts API
// GET /api/v1/creators/[id]/payouts - Get payout history
// POST /api/v1/creators/[id]/payouts - Request payout

import { NextRequest, NextResponse } from "next/server";
import { query, execute } from "@/lib/db/client";
import { isValidEthAddress } from "@/lib/x402";

interface RouteParams {
  params: Promise<{ id: string }>;
}

const MINIMUM_PAYOUT = 50; // $50 minimum

/**
 * GET /api/v1/creators/[id]/payouts - Get payout history
 */
export async function GET(
  req: NextRequest,
  { params }: RouteParams
) {
  try {
    const { id } = await params;

    // Verify creator exists
    const creator = await query(
      "SELECT id, pending_payout, wallet_address FROM creators WHERE id = $1",
      [id]
    );

    if (creator.length === 0) {
      return NextResponse.json(
        { error: "Creator not found" },
        { status: 404 }
      );
    }

    const creatorData = creator[0];

    // Get payout history
    const payouts = await query(
      `SELECT 
        id,
        amount,
        fee,
        net_amount as "netAmount",
        status,
        tx_hash as "txHash",
        created_at as "createdAt",
        processed_at as "processedAt"
      FROM payouts
      WHERE creator_id = $1
      ORDER BY created_at DESC
      LIMIT 50`,
      [id]
    );

    return NextResponse.json({
      success: true,
      data: {
        pendingPayout: creatorData.pending_payout || "0",
        minimumPayout: MINIMUM_PAYOUT,
        canPayout:
          parseFloat(creatorData.pending_payout || "0") >= MINIMUM_PAYOUT,
        payouts: payouts,
      },
    });
  } catch (error) {
    console.error("[Creator Payouts API] Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch payouts" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/v1/creators/[id]/payouts - Request payout
 */
export async function POST(
  req: NextRequest,
  { params }: RouteParams
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { amount, walletAddress } = body;

    // Verify creator exists
    const creator = await query(
      "SELECT id, pending_payout, wallet_address FROM creators WHERE id = $1",
      [id]
    );

    if (creator.length === 0) {
      return NextResponse.json(
        { error: "Creator not found" },
        { status: 404 }
      );
    }

    const creatorData = creator[0];
    const pendingPayout = parseFloat(creatorData.pending_payout || "0");

    // Validate amount
    const payoutAmount = amount
      ? parseFloat(amount)
      : pendingPayout;

    if (payoutAmount < MINIMUM_PAYOUT) {
      return NextResponse.json(
        {
          error: `Minimum payout is $${MINIMUM_PAYOUT}`,
          minimum: MINIMUM_PAYOUT,
          available: pendingPayout,
        },
        { status: 400 }
      );
    }

    if (payoutAmount > pendingPayout) {
      return NextResponse.json(
        {
          error: "Insufficient balance",
          requested: payoutAmount,
          available: pendingPayout,
        },
        { status: 400 }
      );
    }

    // Validate wallet address if provided
    const recipientAddress = walletAddress || creatorData.wallet_address;
    if (!recipientAddress || !isValidEthAddress(recipientAddress)) {
      return NextResponse.json(
        { error: "Valid wallet address required" },
        { status: 400 }
      );
    }

    // Calculate fees (hypothetical - could be gas fees, processing fees, etc.)
    const platformFee = 0; // No additional fee for now
    const netAmount = payoutAmount - platformFee;

    // Create payout request
    const result = await query(
      `INSERT INTO payouts (
        creator_id,
        amount,
        fee,
        net_amount,
        status,
        recipient_address,
        created_at
      ) VALUES ($1, $2, $3, $4, 'pending', $5, NOW())
      RETURNING id, amount, fee, net_amount as "netAmount", status, created_at`,
      [id, payoutAmount.toString(), platformFee.toString(), netAmount.toString(), recipientAddress]
    );

    const payout = result[0];

    // Update creator's pending payout
    await execute(
      "UPDATE creators SET pending_payout = pending_payout - $1 WHERE id = $2",
      [payoutAmount.toString(), id]
    );

    // In production, this would trigger a payment processor
    // For now, we just return the payout request

    return NextResponse.json(
      {
        success: true,
        data: {
          id: payout.id,
          amount: payout.amount,
          fee: payout.fee,
          netAmount: payout.net_amount,
          status: payout.status,
          recipientAddress,
        },
        message: "Payout request submitted. Processing may take 1-3 business days.",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("[Creator Payouts API] Error:", error);
    return NextResponse.json(
      { error: "Failed to process payout request" },
      { status: 500 }
    );
  }
}
