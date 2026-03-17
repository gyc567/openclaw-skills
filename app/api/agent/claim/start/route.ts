import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db/client";
import { withRateLimit } from "@/lib/api/rate-limit";
import { isValidEthAddress } from "@/lib/x402";

export async function POST(req: NextRequest) {
  const rateLimitError = withRateLimit(req, { limit: 10, windowMs: 60 * 1000 });
  if (rateLimitError) return rateLimitError;

  try {
    const body = await req.json();
    const { claim_token, human_wallet_address, signature } = body;

    if (!claim_token) {
      return NextResponse.json(
        { success: false, error: "claim_token is required" },
        { status: 400 }
      );
    }

    if (!human_wallet_address || !isValidEthAddress(human_wallet_address)) {
      return NextResponse.json(
        { success: false, error: "Valid wallet address is required" },
        { status: 400 }
      );
    }

    if (!signature || typeof signature !== "string" || signature.length < 10) {
      return NextResponse.json(
        { success: false, error: "Valid signature is required" },
        { status: 400 }
      );
    }

    const result = await query(
      "SELECT * FROM agent_registrations WHERE claim_token = $1",
      [claim_token]
    );

    if (result.length === 0) {
      return NextResponse.json(
        { success: false, error: "Invalid claim token" },
        { status: 404 }
      );
    }

    const registration = result[0];

    if (registration.status === "claimed" || registration.status === "verified") {
      return NextResponse.json(
        { success: false, error: "Already claimed" },
        { status: 400 }
      );
    }

    if (new Date() > new Date(registration.claim_token_expires)) {
      return NextResponse.json(
        { success: false, error: "Claim token expired" },
        { status: 400 }
      );
    }

    await query(
      `UPDATE agent_registrations 
       SET human_address = $1, status = 'claimed', updated_at = NOW()
       WHERE id = $2`,
      [human_wallet_address.toLowerCase(), registration.id]
    );

    return NextResponse.json({
      success: true,
      message: "Wallet verified successfully",
      next_step: "x_verify",
      data: {
        verification_code: registration.verification_code,
        status: "claimed",
      },
    });
  } catch (error) {
    console.error("[Agent Claim Start API] Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to start claim" },
      { status: 500 }
    );
  }
}
