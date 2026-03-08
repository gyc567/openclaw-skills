// Dashboard API - Creator Dashboard
// GET /api/v1/dashboard - Get dashboard data for authenticated creator

import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db/client";
import { requireAuth } from "@/lib/api/auth";
import { withRateLimit } from "@/lib/api/rate-limit";

/**
 * GET /api/v1/dashboard - Get creator dashboard data
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
    const walletAddress = authAddress.toLowerCase();

    // Get creator info
    const creator = await query(
      `SELECT 
        id,
        address,
        username,
        display_name as "displayName",
        avatar_url as "avatarUrl",
        bio,
        category,
        total_earnings as "totalEarnings",
        total_sales as "totalSales",
        pending_payout as "pendingPayout",
        rating,
        is_verified as "isVerified",
        created_at as "createdAt"
      FROM creators 
      WHERE address = $1`,
      [walletAddress]
    );

    if (creator.length === 0) {
      return NextResponse.json(
        { error: "Creator not found. Please create a creator profile first." },
        { status: 404 }
      );
    }

    const creatorData = creator[0];

    // Get listings summary
    const listings = await query(
      `SELECT 
        COUNT(*) as "totalListings",
        COUNT(*) FILTER (WHERE is_published = true) as "publishedListings",
        COUNT(*) FILTER (WHERE is_published = false) as "draftListings"
      FROM listings 
      WHERE creator_id = $1`,
      [creatorData.id]
    );

    // Get recent transactions (last 10)
    const recentTransactions = await query(
      `SELECT 
        t.id,
        l.name as "listingName",
        t.amount,
        t.platform_fee as "platformFee",
        t.creator_earnings as "creatorEarnings",
        t.status,
        t.created_at as "createdAt"
      FROM transactions t
      LEFT JOIN listings l ON l.id = t.listing_id
      WHERE t.creator_id = $1
      ORDER BY t.created_at DESC
      LIMIT 10`,
      [creatorData.id]
    );

    // Get monthly earnings (last 6 months)
    const monthlyEarnings = await query(
      `SELECT 
        DATE_TRUNC('month', created_at) as "month",
        SUM(creator_earnings) as "earnings",
        COUNT(*) as "sales"
      FROM transactions
      WHERE creator_id = $1 
        AND status = 'completed'
        AND created_at >= NOW() - INTERVAL '6 months'
      GROUP BY DATE_TRUNC('month', created_at)
      ORDER BY month DESC`,
      [creatorData.id]
    );

    // Get top performing listings
    const topListings = await query(
      `SELECT 
        l.id,
        l.name,
        l.category,
        COUNT(t.id) as "salesCount",
        SUM(t.creator_earnings) as "totalEarnings"
      FROM listings l
      LEFT JOIN transactions t ON t.listing_id = l.id AND t.status = 'completed'
      WHERE l.creator_id = $1 AND l.is_published = true
      GROUP BY l.id, l.name, l.category
      ORDER BY "totalEarnings" DESC NULLS LAST
      LIMIT 5`,
      [creatorData.id]
    );

    // Get pending payouts
    const pendingPayouts = await query(
      `SELECT 
        id,
        amount,
        status,
        created_at as "createdAt"
      FROM payouts
      WHERE creator_id = $1 AND status = 'pending'
      ORDER BY created_at DESC`,
      [creatorData.id]
    );

    // Build dashboard response
    const dashboard = {
      profile: {
        id: creatorData.id,
        address: creatorData.address,
        username: creatorData.username,
        displayName: creatorData.display_name,
        avatarUrl: creatorData.avatar_url,
        bio: creatorData.bio,
        category: creatorData.category,
        isVerified: creatorData.is_verified,
        createdAt: creatorData.created_at,
      },
      stats: {
        totalEarnings: creatorData.total_earnings || "0",
        totalSales: creatorData.total_sales || 0,
        pendingPayout: creatorData.pending_payout || "0",
        rating: creatorData.rating || 0,
      },
      listings: {
        total: listings[0]?.totallistings || 0,
        published: listings[0]?.publishedlistings || 0,
        drafts: listings[0]?.draftlistings || 0,
      },
      recentTransactions,
      monthlyEarnings,
      topListings,
      pendingPayouts,
    };

    return NextResponse.json({
      success: true,
      data: dashboard,
    });
  } catch (error) {
    console.error("[Dashboard API] Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch dashboard data" },
      { status: 500 }
    );
  }
}
