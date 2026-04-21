/**
 * Simple IP-based rate limiting.
 * Uses an in-memory Map in development.
 * Uses Vercel KV in production (if available), falls back to in-memory.
 */

const WINDOW_MS = 60 * 60 * 1000; // 1 hour
const MAX_REQUESTS = 10;

// In-memory store (works in dev and as fallback)
const inMemoryStore = new Map<string, { count: number; resetAt: number }>();

function getInMemoryCount(ip: string): { count: number; resetAt: number } {
  const now = Date.now();
  const entry = inMemoryStore.get(ip);
  if (!entry || entry.resetAt < now) {
    const fresh = { count: 0, resetAt: now + WINDOW_MS };
    inMemoryStore.set(ip, fresh);
    return fresh;
  }
  return entry;
}

function incrementInMemory(ip: string): number {
  const entry = getInMemoryCount(ip);
  entry.count += 1;
  inMemoryStore.set(ip, entry);
  return entry.count;
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: number;
}

export async function checkRateLimit(ip: string): Promise<RateLimitResult> {
  try {
    if (process.env.NODE_ENV === 'production' && process.env.KV_REST_API_URL) {
      const { kv } = await import('@vercel/kv');
      const key = `rl:${ip}`;
      const now = Date.now();

      const current = await kv.get<{ count: number; resetAt: number }>(key);

      if (!current || current.resetAt < now) {
        await kv.set(key, { count: 1, resetAt: now + WINDOW_MS }, { px: WINDOW_MS });
        return { allowed: true, remaining: MAX_REQUESTS - 1, resetAt: now + WINDOW_MS };
      }

      if (current.count >= MAX_REQUESTS) {
        return { allowed: false, remaining: 0, resetAt: current.resetAt };
      }

      await kv.set(key, { ...current, count: current.count + 1 }, { px: current.resetAt - now });
      return { allowed: true, remaining: MAX_REQUESTS - current.count - 1, resetAt: current.resetAt };
    }
  } catch {
    // Fall through to in-memory
  }

  const count = incrementInMemory(ip);
  const entry = getInMemoryCount(ip);
  return {
    allowed: count <= MAX_REQUESTS,
    remaining: Math.max(0, MAX_REQUESTS - count),
    resetAt: entry.resetAt,
  };
}

export function getClientIp(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) return forwarded.split(',')[0].trim();
  return request.headers.get('x-real-ip') ?? '127.0.0.1';
}
