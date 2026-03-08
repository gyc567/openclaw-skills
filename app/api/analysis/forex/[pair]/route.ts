// Forex Analysis API with x402 Payment
// GET /api/analysis/forex/[pair] - Get forex analysis

import { NextRequest, NextResponse } from "next/server";
import { x402Middleware } from "@/lib/x402/middleware";

const PLATFORM_WALLET = process.env.PLATFORM_WALLET || "0x742d35Cc6634C0532925a3b844Bc9e7595f0fE12";
const FOREX_PRICE = "0.0005"; // $0.0005 per request

/**
 * Get forex analysis data
 */
async function getForexAnalysis(pair: string) {
  // Mock data - in production, integrate with real forex APIs
  const pairs: Record<string, { base: string; quote: string }> = {
    EURUSD: { base: "EUR", quote: "USD" },
    GBPUSD: { base: "GBP", quote: "USD" },
    USDJPY: { base: "USD", quote: "JPY" },
    AUDUSD: { base: "AUD", quote: "USD" },
    USDCAD: { base: "USD", quote: "CAD" },
  };

  const currencyPair = pairs[pair.toUpperCase()] || { base: pair.slice(0, 3), quote: pair.slice(3, 6) };
  const basePrice = Math.random() * 2 + 0.5;

  return {
    pair: pair.toUpperCase(),
    base: currencyPair.base,
    quote: currencyPair.quote,
    bid: basePrice - Math.random() * 0.001,
    ask: basePrice + Math.random() * 0.001,
    mid: basePrice,
    change: (Math.random() - 0.5) * 0.02,
    changePercent: (Math.random() - 0.5) * 0.5,
    high24h: basePrice * 1.005,
    low24h: basePrice * 0.995,
    volume24h: Math.floor(Math.random() * 100000000),
    timestamp: new Date().toISOString(),
  };
}

async function handler(req: NextRequest, { params }: { params: Promise<{ pair: string }> }) {
  const { pair } = await params;
  const data = await getForexAnalysis(pair);

  return NextResponse.json({
    success: true,
    data,
  });
}

export const GET = x402Middleware(handler, {
  price: FOREX_PRICE,
  recipient: PLATFORM_WALLET,
  description: "Forex analysis data",
});
