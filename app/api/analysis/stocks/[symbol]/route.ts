// Stock Analysis API with x402 Payment
// GET /api/analysis/stocks/[symbol] - Get stock analysis

import { NextRequest, NextResponse } from "next/server";
import { x402Middleware } from "@/lib/x402/middleware";
import { query } from "@/lib/db/client";

// Platform wallet address (should be from environment)
const PLATFORM_WALLET = process.env.PLATFORM_WALLET || "0x742d35Cc6634C0532925a3b844Bc9e7595f0fE12";

// Price tiers for stock analysis
const STOCK_PRICING = {
  basic: "0.001",    // $0.001 - Basic data
  premium: "0.01",  // $0.01 - Premium analysis
  realtime: "0.05", // $0.05 - Real-time data
};

/**
 * Get stock analysis - Basic (free tier)
 */
async function getBasicAnalysis(symbol: string) {
  // Mock data - in production, integrate with real data providers
  return {
    symbol: symbol.toUpperCase(),
    type: "basic",
    price: Math.random() * 500 + 50,
    change: (Math.random() - 0.5) * 10,
    changePercent: (Math.random() - 0.5) * 5,
    volume: Math.floor(Math.random() * 10000000),
    marketCap: Math.floor(Math.random() * 1000000000000),
    timestamp: new Date().toISOString(),
  };
}

/**
 * Get stock analysis - Premium
 */
async function getPremiumAnalysis(symbol: string) {
  const basic = await getBasicAnalysis(symbol);
  return {
    ...basic,
    type: "premium",
    peRatio: Math.random() * 50 + 10,
    dividendYield: Math.random() * 5,
    beta: Math.random() * 2,
    analysts: {
      strongBuy: Math.floor(Math.random() * 10),
      buy: Math.floor(Math.random() * 20),
      hold: Math.floor(Math.random() * 15),
      sell: Math.floor(Math.random() * 5),
      strongSell: Math.floor(Math.random() * 3),
    },
    technicals: {
      rsi: Math.random() * 100,
      macd: (Math.random() - 0.5) * 5,
      movingAvg20: Math.random() * 500 + 50,
      movingAvg50: Math.random() * 500 + 50,
    },
  };
}

/**
 * Get stock analysis - Real-time (highest tier)
 */
async function getRealtimeAnalysis(symbol: string) {
  const premium = await getPremiumAnalysis(symbol);
  return {
    ...premium,
    type: "realtime",
    bid: premium.price - Math.random() * 2,
    ask: premium.price + Math.random() * 2,
    dayHigh: premium.price * 1.05,
    dayLow: premium.price * 0.95,
    lastUpdate: new Date().toISOString(),
    preMarket: {
      price: premium.price + (Math.random() - 0.5) * 5,
      change: (Math.random() - 0.5) * 3,
    },
  };
}

/**
 * Main handler for stock analysis
 */
async function handler(req: NextRequest, { params }: { params: Promise<{ symbol: string }> }) {
  const { symbol } = await params;
  const { searchParams } = new URL(req.url);
  const tier = searchParams.get("tier") || "basic";

  let data;
  switch (tier) {
    case "premium":
      data = await getPremiumAnalysis(symbol);
      break;
    case "realtime":
      data = await getRealtimeAnalysis(symbol);
      break;
    default:
      data = await getBasicAnalysis(symbol);
  }

  return NextResponse.json({
    success: true,
    data,
  });
}

// Export with x402 middleware
export const GET = x402Middleware(handler, {
  price: STOCK_PRICING.basic, // Default price
  recipient: PLATFORM_WALLET,
  description: "Stock analysis data",
});
