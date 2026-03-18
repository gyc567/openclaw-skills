// Agent Registration API
// POST /api/agent - Register agent
// GET /api/agent - Get status

import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db/client";
import { isValidEthAddress } from "@/lib/x402";
import { withRateLimit, createStrictRateLimiter } from "@/lib/api/rate-limit";

/**
 * Generate verification code: OC-XXXXXXXX (8 chars)
 */
function generateVerificationCode(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  const bytes = new Uint8Array(8);
  crypto.getRandomValues(bytes);
  let code = "OC-";
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(bytes[i] % chars.length);
  }
  return code;
}

/**
 * Generate claim token: 64 char hex string
 */
function generateClaimToken(): string {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}

/**
 * POST /api/agent - Register agent and get verification code
 */
export async function POST(req: NextRequest) {
  // Apply strict rate limiting for registration (5 requests per minute)
  const rateLimitError = withRateLimit(req, { limit: 5, windowMs: 60 * 1000 });
  if (rateLimitError) return rateLimitError;

  try {
    const body = await req.json();
    const { agentAddress, humanAddress } = body;

    // Validate agent address
    if (!agentAddress || !isValidEthAddress(agentAddress)) {
      return NextResponse.json(
        { success: false, error: "Invalid agent wallet address" },
        { status: 400 }
      );
    }

    // Validate human address if provided
    if (humanAddress && !isValidEthAddress(humanAddress)) {
      return NextResponse.json(
        { success: false, error: "Invalid human wallet address" },
        { status: 400 }
      );
    }

    // Generate verification code and claim token
    const verificationCode = generateVerificationCode();
    const claimToken = generateClaimToken();
    const claimTokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Insert into database
    const result = await query(
      `INSERT INTO agent_registrations (
        agent_address,
        human_address,
        verification_code,
        claim_token,
        claim_token_expires,
        status,
        created_at,
        updated_at
      ) VALUES ($1, $2, $3, $4, $5, 'pending', NOW(), NOW())
      RETURNING id, verification_code, claim_token, claim_token_expires`,
      [agentAddress.toLowerCase(), humanAddress?.toLowerCase() || null, verificationCode, claimToken, claimTokenExpires]
    );

    const registration = result[0];
    const isProduction = process.env.NODE_ENV === "production";
    const baseUrl = isProduction ? "https://www.opencreditai.com" : (process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000");

    return NextResponse.json({
      success: true,
      data: {
        id: registration.id,
        verificationCode: registration.verification_code,
        claimToken: registration.claim_token,
        claimLink: `${baseUrl}/claim/${registration.claim_token}`,
        expiresAt: registration.claim_token_expires,
      },
    });
  } catch (error) {
    console.error("[Agent API] Register error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to register agent" },
      { status: 500 }
    );
  }
}

/**
 * GET /api/agent - Get registration status
 * Supports: verificationCode, claimToken, or address
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const verificationCode = searchParams.get("verificationCode");
    const claimToken = searchParams.get("claimToken");
    const address = searchParams.get("address");

    // If checking by wallet address - return status for smart redirect
    if (address) {
      const normalizedAddress = address.toLowerCase();
      
      const result = await query(
        `SELECT id, agent_address, agent_name, verification_code, claim_token, status, x_verified, created_at 
         FROM agent_registrations WHERE agent_address = $1 ORDER BY created_at DESC LIMIT 1`,
        [normalizedAddress]
      );

      if (result.length === 0) {
        return NextResponse.json({
          success: true,
          data: {
            hasAgent: false,
            status: "none",
          },
        });
      }

      const agent = result[0];
      let status: "none" | "pending" | "verified" = "none";
      
      if (agent.x_verified) {
        status = "verified";
      } else if (agent.status === "pending" || agent.status === "claimed") {
        status = "pending";
      }

      return NextResponse.json({
        success: true,
        data: {
          hasAgent: true,
          agentId: agent.id,
          status,
          claimToken: agent.claim_token,
          verificationCode: agent.verification_code,
        },
      });
    }

    // Original logic for verificationCode or claimToken
    if (!verificationCode && !claimToken) {
      return NextResponse.json(
        { success: false, error: "verificationCode or claimToken is required" },
        { status: 400 }
      );
    }

    let sql = "SELECT * FROM agent_registrations WHERE 1=1";
    const params: unknown[] = [];

    if (verificationCode) {
      params.push(verificationCode);
      sql += ` AND verification_code = $${params.length}`;
    }

    if (claimToken) {
      params.push(claimToken);
      sql += ` AND claim_token = $${params.length}`;
    }

    const result = await query(sql, params);

    if (result.length === 0) {
      return NextResponse.json(
        { success: false, error: "Registration not found" },
        { status: 404 }
      );
    }

    const registration = result[0];

    return NextResponse.json({
      success: true,
      data: {
        id: registration.id,
        agentAddress: registration.agent_address,
        status: registration.status,
        verificationCode: registration.verification_code,
        xVerified: registration.x_verified,
        xPostUrl: registration.x_post_url,
        createdAt: registration.created_at,
      },
    });
  } catch (error) {
    console.error("[Agent API] Status error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to get status" },
      { status: 500 }
    );
  }
}
