// Wallet API Routes
// POST /api/wallet/register - Register wallet address for agent
// POST /api/wallet/verify - Verify wallet ownership
// GET /api/wallet/:agentId - Get wallet by agent ID

import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db/client";
import { isValidEthAddress } from "@/lib/x402";
import { withRateLimit } from "@/lib/api/rate-limit";
import type { Wallet } from "@/lib/x402/types";

interface WalletRow {
  id: number;
  agent_id: number;
  address: string;
  chain: string;
  is_verified: boolean;
  created_at: Date;
}

/**
 * Register a wallet address for an agent
 */
export async function POST(request: NextRequest) {
  // Apply strict rate limiting
  const rateLimitError = withRateLimit(request, { limit: 10, windowMs: 60 * 1000 });
  if (rateLimitError) return rateLimitError;
  
  try {
    const body = await request.json();
    const { agentId, address, chain = "base" } = body;

    // Validation
    if (!agentId || !address) {
      return NextResponse.json(
        { success: false, error: "agentId and address are required" },
        { status: 400 }
      );
    }

    if (!isValidEthAddress(address)) {
      return NextResponse.json(
        { success: false, error: "Invalid Ethereum address" },
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

    // Check if wallet already exists for this agent
    const existing = await query<WalletRow>(
      "SELECT * FROM wallets WHERE agent_id = $1",
      [agentId]
    );

    let wallet: WalletRow;

    if (existing.length > 0) {
      // Update existing wallet
      const updated = await query<WalletRow>(
        `UPDATE wallets SET address = $2, chain = $3, is_verified = false, updated_at = NOW() 
         WHERE agent_id = $1 RETURNING *`,
        [agentId, address, chain]
      );
      wallet = updated[0];
    } else {
      // Insert new wallet
      const inserted = await query<WalletRow>(
        `INSERT INTO wallets (agent_id, address, chain, is_verified) 
         VALUES ($1, $2, $3, false) RETURNING *`,
        [agentId, address, chain]
      );
      wallet = inserted[0];
    }

    return NextResponse.json({
      success: true,
      wallet: {
        id: wallet.id,
        agentId: wallet.agent_id,
        address: wallet.address,
        chain: wallet.chain,
        isVerified: wallet.is_verified,
      },
    });
  } catch (error) {
    console.error("Wallet registration error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to register wallet" },
      { status: 500 }
    );
  }
}

/**
 * Get wallet by agent ID
 */
export async function GET(request: NextRequest) {
  // Apply rate limiting
  const rateLimitError = withRateLimit(request);
  if (rateLimitError) return rateLimitError;
  
  try {
    const { searchParams } = new URL(request.url);
    const agentId = searchParams.get("agentId");

    if (!agentId) {
      return NextResponse.json(
        { success: false, error: "agentId is required" },
        { status: 400 }
      );
    }

    const wallets = await query<WalletRow>(
      "SELECT * FROM wallets WHERE agent_id = $1",
      [parseInt(agentId)]
    );

    if (wallets.length === 0) {
      return NextResponse.json({
        success: true,
        wallet: null,
      });
    }

    const wallet = wallets[0];

    return NextResponse.json({
      success: true,
      wallet: {
        id: wallet.id,
        agentId: wallet.agent_id,
        address: wallet.address,
        chain: wallet.chain,
        isVerified: wallet.is_verified,
      },
    });
  } catch (error) {
    console.error("Wallet fetch error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch wallet" },
      { status: 500 }
    );
  }
}
