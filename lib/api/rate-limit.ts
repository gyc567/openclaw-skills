import { NextRequest, NextResponse } from 'next/server';
import LRUCache from 'mnemonist/lru-cache';

// Rate limiter using LRU cache (simple in-memory solution)
const rateLimitMap = new LRUCache<string, { count: number; resetTime: number }>(1000);

// Default rate limit: 100 requests per minute
const DEFAULT_LIMIT = 100;
const DEFAULT_WINDOW_MS = 60 * 1000; // 1 minute

export interface RateLimitConfig {
  limit?: number;
  windowMs?: number;
}

export function createRateLimiter(config: RateLimitConfig = {}) {
  const limit = config.limit || DEFAULT_LIMIT;
  const windowMs = config.windowMs || DEFAULT_WINDOW_MS;

  return function rateLimit(req: NextRequest): { success: boolean; remaining: number; resetTime: number } {
    // Get client identifier (IP or forwarded IP)
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0] || 
               req.headers.get('x-real-ip') || 
               'unknown';
    
    const now = Date.now();
    const key = `${ip}:${req.nextUrl.pathname}`;
    
    // Get or create rate limit entry
    let entry = rateLimitMap.get(key);
    
    if (!entry || now > entry.resetTime) {
      entry = { count: 0, resetTime: now + windowMs };
      rateLimitMap.set(key, entry);
    }
    
    entry.count++;
    
    const remaining = Math.max(0, limit - entry.count);
    const success = entry.count <= limit;
    
    return {
      success,
      remaining,
      resetTime: entry.resetTime
    };
  };
}

// Middleware for API routes
export function withRateLimit(req: NextRequest, config: RateLimitConfig = {}) {
  const { success, remaining, resetTime } = createRateLimiter(config)(req);
  
  if (!success) {
    return NextResponse.json(
      { error: 'Too Many Requests', retryAfter: Math.ceil((resetTime - Date.now()) / 1000) },
      { 
        status: 429,
        headers: {
          'X-RateLimit-Limit': String(config.limit || DEFAULT_LIMIT),
          'X-RateLimit-Remaining': String(remaining),
          'X-RateLimit-Reset': String(resetTime),
          'Retry-After': String(Math.ceil((resetTime - Date.now()) / 1000))
        }
      }
    );
  }
  
  return null; // Continue to handler
}

// Strict rate limiter for sensitive endpoints (login, register, etc.)
export function createStrictRateLimiter() {
  return createRateLimiter({ limit: 10, windowMs: 60 * 1000 }); // 10 requests per minute
}

// Export default instance
export const rateLimit = createRateLimiter();
