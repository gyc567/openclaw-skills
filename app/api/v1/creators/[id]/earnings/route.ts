// Creator Earnings API
// GET /api/v1/creators/[id]/earnings - Get creator's earnings

import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db/client";

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/v1/creators/[id]/earnings - Get creator earnings breakdown
 */
export async function GET(
  req: NextRequest,
  { params }: RouteParams
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(req.url);
    const period = searchParams.get("period") || "all"; // '7d' | '30d' | 'all'

    // Verify creator exists
    const creator = await query(
      "SELECT id, total_earnings, total_sales, pending_payout FROM creators WHERE id = $1",
      [id]
    );

    if (creator.length === 0) {
      return NextResponse.json(
        { error: "Creator not found" },
        { status: 404 }
      );
    }

    const creatorData = creator[0];

    // Build date filter
    let dateFilter = "";
    if (period === "7d") {
      dateFilter = "AND created_at >= NOW() - INTERVAL '7 days'";
    } else if (period === "30d") {
      dateFilter = "AND created_at >= NOW() - INTERVAL '30 days'";
    }

    // Get recent transactions
    const transactions = await query(
      `SELECT 
        t.id,
        t.listing_id as "listingId",
        l.name as "listingName",
        t.amount,
        t.platform_fee as "platformFee",
        t.creator_earnings as "creatorEarnings",
        t.status,
        t.created_at as "createdAt"
      FROM transactions t
      LEFT JOIN listings l ON l.id = t.listing_id
      WHERE t.creator_id = $1 ${dateFilter}
      ORDER BY t.created_at DESC
      LIMIT 50`,
      [id]
    );

    // Calculate period earnings
    const periodEarnings = await query(
      `SELECT 
        COALESCE(SUM(amount), 0) as "totalAmount",
        COALESCE(SUM(platform_fee), 0) as "totalPlatformFee",
        COALESCE(SUM(creator_earnings), 0) as "totalCreatorEarnings",
        COUNT(*) as "transactionCount"
      FROM transactions
      WHERE creator_id = $1 AND status = 'completed' ${dateFilter}`,
      [id]
    );

    return NextResponse.json({
      success: true,
      data: {
        summary: {
          totalEarnings: creatorData.total_earnings || "0",
          totalSales: creatorData.total_sales || 0,
          pendingPayout: creatorData.pending_payout || "0",
        },
        period: {
          totalAmount: periodEarnings[0]?.totalAmount || "0",
          platformFee: periodEarnings[0]?.totalPlatformFee || "0",
          creatorEarnings: periodEarnings[0]?.totalCreatorEarnings || "0",
          transactionCount: periodEarnings[0]?.transactionCount || 0,
        },
        transactions: transactions,
      },
    });
  } catch (error) {
    console.error("[Creator Earnings API] Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch earnings" },
      { status: 500 }
    );
  }
}
