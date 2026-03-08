// Authentication API
// POST /api/v1/auth - Authenticate with wallet signature

import { NextRequest, NextResponse } from "next/server";
import { query, execute } from "@/lib/db/client";
import { isValidEthAddress } from "@/lib/x402";

/**
 * POST /api/v1/auth - Authenticate with wallet signature
 * 
 * Body: { address, signature, message }
 * 
 * This is a simplified auth flow. In production:
 * 1. Generate a nonce for the user
 * 2. User signs a message with their wallet
 * 3. Verify signature server-side
 * 4. Create session token (JWT)
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { address, signature, message } = body;

    // Validate wallet address
    if (!address || !isValidEthAddress(address)) {
      return NextResponse.json(
        { error: "Invalid wallet address" },
        { status: 400 }
      );
    }

    // For development/testing: accept any signature with specific message
    // In production, verify the signature properly
    const expectedMessage = "Sign to authenticate with OpenClaw Skills";
    
    if (message !== expectedMessage) {
      // Allow custom messages in development
      console.log("[Auth] Custom message received:", message);
    }

    // Check if creator exists
    let creator = await query(
      "SELECT id, address, username, display_name, is_verified FROM creators WHERE address = $1",
      [address.toLowerCase()]
    );

    let isNewCreator = false;

    if (creator.length === 0) {
      // Auto-create creator on first login
      const username = `user_${address.toLowerCase().slice(2, 8)}`;
      const result = await query(
        `INSERT INTO creators (
          address,
          username,
          display_name,
          is_verified,
          created_at,
          updated_at
        ) VALUES ($1, $2, $3, false, NOW(), NOW())
        RETURNING id, address, username, display_name, is_verified`,
        [address.toLowerCase(), username, username]
      );
      
      creator = result;
      isNewCreator = true;
    }

    const user = creator[0];

    // In production, generate JWT token here
    // For now, return basic user info
    const token = Buffer.from(
      JSON.stringify({
        address: user.address,
        creatorId: user.id,
        exp: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 days
      })
    ).toString("base64");

    return NextResponse.json({
      success: true,
      data: {
        token,
        user: {
          id: user.id,
          address: user.address,
          username: user.username,
          displayName: user.display_name,
          isVerified: user.is_verified,
        },
      },
      message: isNewCreator
        ? "Welcome! Your creator account has been created."
        : "Authenticated successfully",
    });
  } catch (error) {
    console.error("[Auth API] Error:", error);
    return NextResponse.json(
      { error: "Authentication failed" },
      { status: 500 }
    );
  }
}
