// Crypto Analysis API with x402 Payment
// GET /api/analysis/crypto/[symbol] - Get crypto analysis

import { NextRequest, NextResponse } from "next/server";
import { x402Middleware } from "@/lib/x402/middleware";

const PLATFORM_WALLET = process.env.PLATFORM_WALLET || "0x742d35Cc6634C0532925a3b844Bc9e7595f0fE12";

const CRYPTO_PRICING = {
  basic: "0.001",
  premium: "0.01",
};

/**
 * Get crypto analysis data
 */
async function getCryptoAnalysis(symbol: string, tier: string = "basic") {
  // Mock data - in production, integrate with CoinGecko, Binance, etc.
  const basePrice = Math.random() * 50000 + 100;
  
  const result: Record<string, unknown> = {
    symbol: symbol.toUpperCase(),
    name: getCryptoName(symbol),
    price: basePrice,
    change24h: (Math.random() - 0.5) * 10,
    changePercent24h: (Math.random() - 0.5) * 10,
    marketCap: basePrice * Math.floor(Math.random() * 1000000000),
    volume24h: Math.floor(Math.random() * 10000000000),
    high24h: basePrice * 1.05,
    low24h: basePrice * 0.95,
    circulatingSupply: Math.floor(Math.random() * 100000000),
    totalSupply: Math.floor(Math.random() * 1000000000),
    maxSupply: Math.floor(Math.random() * 1000000000),
    timestamp: new Date().toISOString(),
  };

  if (tier === "premium") {
    result.rank = Math.floor(Math.random() * 100) + 1;
    result.ath = basePrice * 1.5;
    result.athChangePercent = (Math.random() - 0.5) * 50;
    result.atl = basePrice * 0.5;
    result.atlChangePercent = (Math.random() - 0.5) * 200;
    result.fearGreedIndex = Math.floor(Math.random() * 100);
  }

  return result;
}

function getCryptoName(symbol: string): string {
  const names: Record<string, string> = {
    BTC: "Bitcoin",
    ETH: "Ethereum",
    BNB: "Binance Coin",
    SOL: "Solana",
    XRP: "Ripple",
    ADA: "Cardano",
    DOGE: "Dogecoin",
    DOT: "Polkadot",
    MATIC: "Polygon",
    LTC: "Litecoin",
  };
  return names[symbol.toUpperCase()] || symbol;
}

async function handler(req: NextRequest, { params }: { params: Promise<{ symbol: string }> }) {
  const { symbol } = await params;
  const { searchParams } = new URL(req.url);
  const tier = searchParams.get("tier") || "basic";

  const data = await getCryptoAnalysis(symbol, tier);

  return NextResponse.json({
    success: true,
    data,
  });
}

export const GET = x402Middleware(handler, {
  price: CRYPTO_PRICING.basic,
  recipient: PLATFORM_WALLET,
  description: "Cryptocurrency analysis data",
});
