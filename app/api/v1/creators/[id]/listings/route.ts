// Creator's Listings API
// GET /api/v1/creators/[id]/listings - Get creator's listings
// POST /api/v1/creators/[id]/listings - Create new listing

import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db/client";
import { isValidEthAddress } from "@/lib/x402";

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/v1/creators/[id]/listings - Get all listings for a creator
 */
export async function GET(
  req: NextRequest,
  { params }: RouteParams
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status"); // 'draft' | 'published' | 'all'

    let sql = `
      SELECT 
        id,
        name,
        description,
        category,
        price_usd as "priceUsd",
        is_published as "isPublished",
        version,
        package_url as "packageUrl",
        created_at as "createdAt",
        updated_at as "updatedAt"
      FROM listings
      WHERE creator_id = $1
    `;
    const paramsArray: unknown[] = [id];

    if (status === "draft") {
      sql += ` AND is_published = false`;
    } else if (status === "published") {
      sql += ` AND is_published = true`;
    }

    sql += ` ORDER BY updated_at DESC`;

    const listings = await query(sql, paramsArray);

    return NextResponse.json({
      success: true,
      data: listings,
    });
  } catch (error) {
    console.error("[Creator Listings API] Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch listings" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/v1/creators/[id]/listings - Create new listing
 */
export async function POST(
  req: NextRequest,
  { params }: RouteParams
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const {
      name,
      description,
      category,
      priceUsd,
      version,
      packageUrl,
    } = body;

    // Validate required fields
    if (!name || name.length < 3) {
      return NextResponse.json(
        { error: "Name must be at least 3 characters" },
        { status: 400 }
      );
    }

    if (!packageUrl) {
      return NextResponse.json(
        { error: "Package URL is required" },
        { status: 400 }
      );
    }

    // Verify creator exists
    const creator = await query(
      "SELECT id, address FROM creators WHERE id = $1",
      [id]
    );

    if (creator.length === 0) {
      return NextResponse.json(
        { error: "Creator not found" },
        { status: 404 }
      );
    }

    // Create listing
    const result = await query(
      `INSERT INTO listings (
        creator_id,
        name,
        description,
        category,
        price_usd,
        version,
        package_url,
        is_published,
        created_at,
        updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, false, NOW(), NOW())
      RETURNING id, name, description, category, price_usd as "priceUsd", version`,
      [
        id,
        name,
        description || "",
        category || "general",
        priceUsd || "0",
        version || "1.0.0",
        packageUrl,
      ]
    );

    const listing = result[0];

    return NextResponse.json(
      {
        success: true,
        data: {
          id: listing.id,
          name: listing.name,
          description: listing.description,
          category: listing.category,
          priceUsd: listing.price_usd,
          version: listing.version,
          isPublished: false,
        },
        message: "Listing created. Publish it to make it available.",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("[Creator Listings API] Create error:", error);
    return NextResponse.json(
      { error: "Failed to create listing" },
      { status: 500 }
    );
  }
}
