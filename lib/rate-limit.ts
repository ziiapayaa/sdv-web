import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

/**
 * Redis-based rate limiter using Upstash.
 * Survives serverless cold starts — state is shared across all instances.
 * 
 * Fallback: If UPSTASH_REDIS_REST_URL is not configured, falls back to in-memory.
 * 
 * Setup:
 * 1. Create a free Redis database at https://upstash.com
 * 2. Add UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN to .env
 */

let ratelimit: Ratelimit | null = null;

if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
  const redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN,
  });

  ratelimit = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(5, "60 s"), // 5 requests per 60 seconds
    analytics: true,
    prefix: "sdv:ratelimit",
  });
}

// Fallback in-memory map for development / when Redis is not configured
const memoryMap = new Map<string, { count: number; firstTime: number; lastTime: number; lastProduct?: string }>();

export async function checkRateLimitRedis(
  identifier: string,
  productId?: string
): Promise<{ allowed: boolean; reason?: string }> {
  // Use Redis if available
  if (ratelimit) {
    const { success, remaining } = await ratelimit.limit(identifier);
    if (!success) {
      return { 
        allowed: false, 
        reason: `Rate limit exceeded. Try again shortly. (${remaining} remaining)` 
      };
    }
    return { allowed: true };
  }

  // Fallback: in-memory rate limiter
  const now = Date.now();
  const data = memoryMap.get(identifier);

  if (data && now - data.firstTime > 60000) {
    memoryMap.delete(identifier);
  }

  const current = memoryMap.get(identifier) || { count: 0, firstTime: now, lastTime: 0 };

  // Rapid duplicate protection (same product within 3s)
  if (productId && current.lastProduct === productId && now - current.lastTime < 3000) {
    return { allowed: false, reason: "Please wait 3 seconds before trying again." };
  }

  if (current.count >= 5) {
    return { allowed: false, reason: "Rate limit exceeded. Try again in a minute." };
  }

  current.count += 1;
  current.lastTime = now;
  current.lastProduct = productId;
  memoryMap.set(identifier, current);

  return { allowed: true };
}
