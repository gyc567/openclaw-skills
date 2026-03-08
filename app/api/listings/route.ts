// Listings API Routes
// GET /api/listings - Get all listings
// POST /api/listings - Create a new listing

import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db/client";
import { calculatePlatformFee, calculateSellerEarnings } from "@/lib/x402";
import { withRateLimit } from "@/lib/api/rate-limit";

interface ListingRow {
  id: number;
  agent_id: number;
  type: string;
  name: string;
  description: string | null;
  category: string | null;
  price_usd: number;
  is_published: boolean;
  version: string;
  package_url: string | null;
  x402_enabled: boolean;
  created_at: Date;
  updated_at: Date;
}

/**
 * GET /api/listings - Get listings with filtering
 */
export async function GET(request: NextRequest) {
  // Apply rate limiting
  const rateLimitError = withRateLimit(request);
  if (rateLimitError) return rateLimitError;
  
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const category = searchParams.get("category");
    const type = searchParams.get("type");
    const published = searchParams.get("published");

    const offset = (page - 1) * limit;

    // Build query
    let whereClause = "WHERE 1=1";
    const params: unknown[] = [];
    let paramIndex = 1;

    if (category) {
      whereClause += ` AND category = $${paramIndex}`;
      params.push(category);
      paramIndex++;
    }

    if (type) {
      whereClause += ` AND type = $${paramIndex}`;
      params.push(type);
      paramIndex++;
    }

    if (published !== null) {
      whereClause += ` AND is_published = $${paramIndex}`;
      params.push(published === "true");
      paramIndex++;
    }

    // Get total count
    const countResult = await query<{ count: string }>(
      `SELECT COUNT(*) as count FROM listings ${whereClause}`,
      params
    );
    const total = parseInt(countResult[0]?.count || "0");

    // Get listings
    const listings = await query<ListingRow>(
      `${whereClause} ORDER BY created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`,
      [...params, limit, offset]
    );

    return NextResponse.json({
      success: true,
      data: listings.map((l) => ({
        id: l.id,
        agentId: l.agent_id,
        type: l.type,
        name: l.name,
        description: l.description,
        category: l.category,
        priceUsd: l.price_usd,
        isPublished: l.is_published,
        version: l.version,
        packageUrl: l.package_url,
        x402Enabled: l.x402_enabled,
        createdAt: l.created_at,
        updatedAt: l.updated_at,
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Listings fetch error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch listings" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/listings - Create a new listing
 */
export async function POST(request: NextRequest) {
  // Apply strict rate limiting for creation
  const rateLimitError = withRateLimit(request, { limit: 10, windowMs: 60 * 1000 });
  if (rateLimitError) return rateLimitError;
  
  try {
    const body = await request.json();
    const {
      agentId,
      type = "skill",
      name,
      description,
      category,
      priceUsd = 0,
      version = "1.0.0",
      packageUrl,
      x402Enabled = true,
    } = body;

    // Validation
    if (!agentId || !name) {
      return NextResponse.json(
        { success: false, error: "agentId and name are required" },
        { status: 400 }
      );
    }

    // Check if agent exists
    const agents = await query<{ id: number }>("SELECT id FROM agents WHERE id = $1", [agentId]);
    if (agents.length === 0) {
      return NextResponse.json(
        { success: false, error: "Agent not found" },
        { status: 404 }
      );
    }

    // Check if agent has a wallet
    const wallets = await query<{ address: string }>(
      "SELECT address FROM wallets WHERE agent_id = $1 AND is_verified = true",
      [agentId]
    );

    const recipientAddress = wallets[0]?.address;

    // Create listing
    const listings = await query<ListingRow>(
      `INSERT INTO listings (
        agent_id, type, name, description, category, 
        price_usd, version, package_url, x402_enabled
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *`,
      [
        agentId,
        type,
        name,
        description,
        category,
        priceUsd,
        version,
        packageUrl,
        x402Enabled,
      ]
    );

    const listing = listings[0];

    // Calculate platform fee and seller earnings
    const platformFee = calculatePlatformFee(priceUsd);
    const sellerEarnings = calculateSellerEarnings(priceUsd);

    return NextResponse.json({
      success: true,
      listing: {
        id: listing.id,
        agentId: listing.agent_id,
        type: listing.type,
        name: listing.name,
        description: listing.description,
        category: listing.category,
        priceUsd: listing.price_usd,
        isPublished: listing.is_published,
        version: listing.version,
        packageUrl: listing.package_url,
        x402Enabled: listing.x402_enabled,
        createdAt: listing.created_at,
        updatedAt: listing.updated_at,
      },
      pricing: {
        priceUsd,
        platformFee,
        sellerEarnings,
        recipientAddress,
      },
    });
  } catch (error) {
    console.error("Listing creation error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create listing" },
      { status: 500 }
    );
  }
}
