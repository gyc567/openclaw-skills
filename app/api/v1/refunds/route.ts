// Refunds API
// GET /api/v1/refunds - List user's refunds
// POST /api/v1/refunds - Request refund

import { NextRequest, NextResponse } from "next/server";
import { query, execute } from "@/lib/db/client";
import { requireAuth } from "@/lib/api/auth";
import { withRateLimit, createStrictRateLimiter } from "@/lib/api/rate-limit";

const REFUND_WINDOW_DAYS = 7;

/**
 * GET /api/v1/refunds - Get user's refund requests
 */
export async function GET(req: NextRequest) {
  // Apply rate limiting
  const rateLimitError = withRateLimit(req);
  if (rateLimitError) return rateLimitError;

  // Require authentication
  const authResult = requireAuth(req);
  if (authResult instanceof NextResponse) {
    return authResult;
  }
  
  const { address: authAddress } = authResult;

  try {

    const refunds = await query(
      `SELECT 
        r.id,
        r.purchase_id as "purchaseId",
        r.amount,
        r.status,
        r.reason,
        r.created_at as "createdAt",
        r.processed_at as "processedAt",
        l.name as "listingName"
      FROM refunds r
      LEFT JOIN transactions t ON t.id = r.purchase_id
      LEFT JOIN listings l ON l.id = t.listing_id
      WHERE r.buyer_address = $1
      ORDER BY r.created_at DESC
      LIMIT 50`,
      [authAddress.toLowerCase()]
    );

    return NextResponse.json({
      success: true,
      data: refunds,
    });
  } catch (error) {
    console.error("[Refunds API] Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch refunds" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/v1/refunds - Request a refund
 */
export async function POST(req: NextRequest) {
  // Apply strict rate limiting for sensitive operations
  const rateLimitError = withRateLimit(req, { limit: 5, windowMs: 60 * 1000 });
  if (rateLimitError) return rateLimitError;

  // Require authentication
  const authResult = requireAuth(req);
  if (authResult instanceof NextResponse) {
    return authResult;
  }
  
  const { address: authAddress } = authResult;

  try {
    const body = await req.json();
    const { purchaseId, reason } = body;

    if (!purchaseId) {
      return NextResponse.json(
        { error: "Purchase ID required" },
        { status: 400 }
      );
    }

    // Verify the purchase exists and belongs to the user
    const purchase = await query(
      `SELECT 
        t.id,
        t.amount,
        t.creator_earnings,
        t.status,
        t.buyer_address,
        t.created_at as "createdAt"
      FROM transactions t
      WHERE t.id = $1 AND t.buyer_address = $2`,
      [purchaseId, authAddress.toLowerCase()]
    );

    if (purchase.length === 0) {
      return NextResponse.json(
        { error: "Purchase not found" },
        { status: 404 }
      );
    }

    const purchaseData = purchase[0];

    // Check if already refunded
    if (purchaseData.status === "refunded") {
      return NextResponse.json(
        { error: "Already refunded" },
        { status: 400 }
      );
    }

    // Check refund window (7 days)
    const purchaseDate = new Date(purchaseData.createdAt);
    const now = new Date();
    const daysSincePurchase = Math.floor(
      (now.getTime() - purchaseDate.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (daysSincePurchase > REFUND_WINDOW_DAYS) {
      return NextResponse.json(
        {
          error: `Refund window expired. Refunds only available within ${REFUND_WINDOW_DAYS} days of purchase.`,
          daysSincePurchase,
          refundWindow: REFUND_WINDOW_DAYS,
        },
        { status: 400 }
      );
    }

    // Check if there's already a pending refund
    const existingRefund = await query(
      "SELECT id, status FROM refunds WHERE purchase_id = $1 AND status IN ('pending', 'approved')",
      [purchaseId]
    );

    if (existingRefund.length > 0) {
      return NextResponse.json(
        { error: "Refund already requested", status: existingRefund[0].status },
        { status: 400 }
      );
    }

    // Create refund request
    const result = await query(
      `INSERT INTO refunds (
        purchase_id,
        amount,
        buyer_address,
        reason,
        status,
        created_at
      ) VALUES ($1, $2, $3, $4, 'pending', NOW())
      RETURNING id, purchase_id as "purchaseId", amount, status, created_at`,
      [
        purchaseId,
        purchaseData.amount,
        authAddress.toLowerCase(),
        reason || "No reason provided",
      ]
    );

    const refund = result[0];

    // In production, this would trigger:
    // 1. Notification to creator
    // 2. Admin review process
    // 3. Automatic/com manual refund processing

    return NextResponse.json(
      {
        success: true,
        data: {
          id: refund.id,
          purchaseId: refund.purchase_id,
          amount: refund.amount,
          status: refund.status,
          createdAt: refund.created_at,
        },
        message: `Refund requested. You'll be notified once processed. (${REFUND_WINDOW_DAYS}-day refund policy)`,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("[Refunds API] Error:", error);
    return NextResponse.json(
      { error: "Failed to process refund request" },
      { status: 500 }
    );
  }
}
