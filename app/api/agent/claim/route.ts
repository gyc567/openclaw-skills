// Agent Claim API
// POST /api/agent/claim - Claim agent registration

import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db/client";
import { withRateLimit } from "@/lib/api/rate-limit";

/**
 * POST /api/agent/claim - Human claims agent
 */
export async function POST(req: NextRequest) {
  // Apply rate limiting
  const rateLimitError = withRateLimit(req, { limit: 10, windowMs: 60 * 1000 });
  if (rateLimitError) return rateLimitError;
  try {
    const body = await req.json();
    const { claimToken, humanAddress } = body;

    if (!claimToken) {
      return NextResponse.json(
        { success: false, error: "claimToken is required" },
        { status: 400 }
      );
    }

    // Find registration by claim token
    const result = await query(
      "SELECT * FROM agent_registrations WHERE claim_token = $1",
      [claimToken]
    );

    if (result.length === 0) {
      return NextResponse.json(
        { success: false, error: "Invalid claim token" },
        { status: 404 }
      );
    }

    const registration = result[0];

    // Check if already claimed
    if (registration.status === "claimed" || registration.status === "verified") {
      return NextResponse.json(
        { success: false, error: "Already claimed" },
        { status: 400 }
      );
    }

    // Check if token expired
    if (new Date() > new Date(registration.claim_token_expires)) {
      return NextResponse.json(
        { success: false, error: "Claim token expired" },
        { status: 400 }
      );
    }

    // Update registration
    await query(
      `UPDATE agent_registrations 
       SET human_address = $1, status = 'claimed', updated_at = NOW()
       WHERE id = $2`,
      [humanAddress?.toLowerCase() || null, registration.id]
    );

    return NextResponse.json({
      success: true,
      message: "Agent claimed successfully",
      data: {
        verificationCode: registration.verification_code,
        status: "claimed",
      },
    });
  } catch (error) {
    console.error("[Agent Claim API] Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to claim agent" },
      { status: 500 }
    );
  }
}
