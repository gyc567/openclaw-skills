// Creator API - GET/POST creators
// GET /api/v1/creators - List creators (public)
// POST /api/v1/creators - Create creator profile

import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db/client";
import { isValidEthAddress } from "@/lib/x402";

/**
 * GET /api/v1/creators - List all verified creators
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get("limit") || "20");
    const offset = parseInt(searchParams.get("offset") || "0");
    const category = searchParams.get("category");

    let sql = `
      SELECT 
        c.id,
        c.address,
        c.username,
        c.display_name as "displayName",
        c.avatar_url as "avatarUrl",
        c.bio,
        c.category,
        c.total_earnings as "totalEarnings",
        c.total_sales as "totalSales",
        c.rating,
        c.created_at as "createdAt",
        COUNT(l.id) as "listingCount"
      FROM creators c
      LEFT JOIN listings l ON l.creator_id = c.id AND l.is_published = true
      WHERE c.is_verified = true
    `;
    const params: unknown[] = [];

    if (category) {
      sql += ` AND c.category = $1`;
      params.push(category);
      sql += ` GROUP BY c.id ORDER BY c.total_sales DESC LIMIT $2 OFFSET $3`;
      params.push(limit, offset);
    } else {
      sql += ` GROUP BY c.id ORDER BY c.total_sales DESC LIMIT $1 OFFSET $2`;
      params.push(limit, offset);
    }

    const creators = await query(sql, params);

    return NextResponse.json({
      success: true,
      data: creators,
      pagination: {
        limit,
        offset,
      },
    });
  } catch (error) {
    console.error("[Creator API] List error:", error);
    return NextResponse.json(
      { error: "Failed to fetch creators" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/v1/creators - Create creator profile
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { address, username, displayName, bio, category, avatarUrl } = body;

    // Validate wallet address
    if (!address || !isValidEthAddress(address)) {
      return NextResponse.json(
        { error: "Invalid wallet address" },
        { status: 400 }
      );
    }

    // Check if creator already exists
    const existing = await query(
      "SELECT id FROM creators WHERE address = $1",
      [address.toLowerCase()]
    );

    if (existing.length > 0) {
      return NextResponse.json(
        { error: "Creator already exists", creatorId: existing[0].id },
        { status: 409 }
      );
    }

    // Validate username
    if (!username || username.length < 3 || username.length > 30) {
      return NextResponse.json(
        { error: "Username must be 3-30 characters" },
        { status: 400 }
      );
    }

    // Create creator
    const result = await query(
      `INSERT INTO creators (
        address,
        username,
        display_name,
        bio,
        category,
        avatar_url,
        is_verified,
        created_at,
        updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, false, NOW(), NOW())
      RETURNING id, address, username, display_name as "displayName", category`,
      [
        address.toLowerCase(),
        username,
        displayName || username,
        bio || "",
        category || "general",
        avatarUrl || "",
      ]
    );

    const creator = result[0];

    return NextResponse.json(
      {
        success: true,
        data: {
          id: creator.id,
          address: creator.address,
          username: creator.username,
          displayName: creator.display_name,
          category: creator.category,
          isVerified: false,
        },
        message:
          "Creator profile created. Please verify your wallet to publish listings.",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("[Creator API] Create error:", error);
    return NextResponse.json(
      { error: "Failed to create creator" },
      { status: 500 }
    );
  }
}
