// Agent Verification API
// POST /api/agent/verify - Verify X.com post

import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db/client";

/**
 * Validate X.com post URL format
 */
function isValidXPostUrl(url: string): boolean {
  const pattern = /^https:\/\/x\.com\/[a-zA-Z0-9_]+\/status\/\d+$/;
  return pattern.test(url);
}

/**
 * POST /api/agent/verify - Verify X.com post
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { verificationCode, xPostUrl } = body;

    if (!verificationCode || !xPostUrl) {
      return NextResponse.json(
        { success: false, error: "verificationCode and xPostUrl are required" },
        { status: 400 }
      );
    }

    // Validate X.com URL format
    if (!isValidXPostUrl(xPostUrl)) {
      return NextResponse.json(
        { success: false, error: "Invalid X.com post URL format" },
        { status: 400 }
      );
    }

    // Find registration by verification code
    const result = await query(
      "SELECT * FROM agent_registrations WHERE verification_code = $1",
      [verificationCode]
    );

    if (result.length === 0) {
      return NextResponse.json(
        { success: false, error: "Invalid verification code" },
        { status: 404 }
      );
    }

    const registration = result[0];

    // Check if already verified
    if (registration.status === "verified") {
      return NextResponse.json({
        success: true,
        message: "Already verified",
        data: {
          status: "verified",
          verificationCode: registration.verification_code,
        },
      });
    }

    // Update registration with X.com post URL and mark as verified
    await query(
      `UPDATE agent_registrations 
       SET x_post_url = $1, x_verified = TRUE, status = 'verified', 
           x_posted_at = NOW(), updated_at = NOW()
       WHERE id = $2`,
      [xPostUrl, registration.id]
    );

    return NextResponse.json({
      success: true,
      verified: true,
      message: "X.com verification successful",
      data: {
        status: "verified",
        verificationCode: registration.verification_code,
      },
    });
  } catch (error) {
    console.error("[Agent Verify API] Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to verify" },
      { status: 500 }
    );
  }
}
