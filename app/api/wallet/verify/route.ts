// Wallet Verification API
// POST /api/wallet/verify - Verify wallet ownership via signature

import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db/client";
import { isValidEthAddress } from "@/lib/x402";

interface WalletRow {
  id: number;
  agent_id: number;
  address: string;
  chain: string;
  is_verified: boolean;
  created_at: Date;
}

/**
 * Verify wallet ownership by checking signature
 * The client signs a message proving they own the wallet
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { agentId, signature, message } = body;

    // Validation
    if (!agentId || !signature || !message) {
      return NextResponse.json(
        { success: false, error: "agentId, signature, and message are required" },
        { status: 400 }
      );
    }

    // Get wallet for agent
    const wallets = await query<WalletRow>(
      "SELECT * FROM wallets WHERE agent_id = $1",
      [agentId]
    );

    if (wallets.length === 0) {
      return NextResponse.json(
        { success: false, error: "Wallet not found for this agent" },
        { status: 404 }
      );
    }

    const wallet = wallets[0];

    // Note: In production, you would verify the signature using ethers.js or viem
    // For now, we mark as verified if signature is present (simplified for demo)
    // The actual verification requires:
    // 1. Recover address from signature
    // 2. Compare with wallet.address

    // Simulate verification (in production, use actual signature verification)
    const isValidSignature = signature && signature.length > 0;

    if (!isValidSignature) {
      return NextResponse.json(
        { success: false, error: "Invalid signature" },
        { status: 400 }
      );
    }

    // Mark wallet as verified
    await query(
      "UPDATE wallets SET is_verified = true WHERE agent_id = $1",
      [agentId]
    );

    return NextResponse.json({
      success: true,
      verified: true,
      wallet: {
        address: wallet.address,
        chain: wallet.chain,
      },
    });
  } catch (error) {
    console.error("Wallet verification error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to verify wallet" },
      { status: 500 }
    );
  }
}
