import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db/client";
import { withRateLimit } from "@/lib/api/rate-limit";

function parseXLink(url: string): { username: string; postId: string } | null {
  const patterns = [
    /^https?:\/\/x\.com\/([^/]+)\/status\/(\d+)/,
    /^https?:\/\/twitter\.com\/([^/]+)\/status\/(\d+)/,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) {
      return { username: match[1], postId: match[2] };
    }
  }
  return null;
}

export async function POST(req: NextRequest) {
  const rateLimitError = withRateLimit(req, { limit: 10, windowMs: 60 * 1000 });
  if (rateLimitError) return rateLimitError;

  try {
    const body = await req.json();
    const { claim_token, x_post_url } = body;

    if (!claim_token) {
      return NextResponse.json(
        { success: false, error: "claim_token is required" },
        { status: 400 }
      );
    }

    if (!x_post_url) {
      return NextResponse.json(
        { success: false, error: "x_post_url is required" },
        { status: 400 }
      );
    }

    const parsed = parseXLink(x_post_url);
    if (!parsed) {
      return NextResponse.json(
        { success: false, error: "Invalid X.com link format. Use: https://x.com/username/status/xxxxx" },
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

    if (registration.status !== "claimed") {
      return NextResponse.json(
        { success: false, error: "Claim not started. Complete wallet verification first." },
        { status: 400 }
      );
    }

    await query(
      `UPDATE agent_registrations 
       SET x_post_url = $1, x_verified = true, status = 'verified', x_posted_at = NOW(), updated_at = NOW()
       WHERE id = $2`,
      [x_post_url, registration.id]
    );

    return NextResponse.json({
      success: true,
      message: "Agent claimed and verified successfully!",
      agent: {
        id: registration.id,
        verification_code: registration.verification_code,
        x_handle: `@${parsed.username}`,
        status: "verified",
      },
    });
  } catch (error) {
    console.error("[Agent Claim Complete API] Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to complete claim" },
      { status: 500 }
    );
  }
}
