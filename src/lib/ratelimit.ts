/**
 * Rate limiting utilities.
 * - Production: uses @upstash/ratelimit with Vercel KV (set KV_REST_API_URL + KV_REST_API_TOKEN)
 * - Development: in-memory sliding window fallback (single-instance only)
 */

export interface RateLimitResult {
  success: boolean
  limit: number
  remaining: number
  reset: number // Unix timestamp (seconds) when the window resets
}

// ─── In-memory fallback ───────────────────────────────────────────────────────

interface WindowEntry {
  timestamps: number[] // request timestamps in ms
}

class InMemoryRatelimit {
  private store = new Map<string, WindowEntry>()

  constructor(
    private readonly max: number,
    private readonly windowMs: number,
  ) {}

  limit(identifier: string): RateLimitResult {
    const now = Date.now()
    const windowStart = now - this.windowMs
    const entry = this.store.get(identifier) ?? { timestamps: [] }

    // Drop timestamps outside the window
    entry.timestamps = entry.timestamps.filter((t) => t > windowStart)

    const remaining = Math.max(0, this.max - entry.timestamps.length)
    const reset = Math.ceil((entry.timestamps[0] ?? now + this.windowMs) / 1000 + this.windowMs / 1000)

    if (entry.timestamps.length >= this.max) {
      this.store.set(identifier, entry)
      return { success: false, limit: this.max, remaining: 0, reset }
    }

    entry.timestamps.push(now)
    this.store.set(identifier, entry)

    return {
      success: true,
      limit: this.max,
      remaining: remaining - 1,
      reset: Math.ceil((now + this.windowMs) / 1000),
    }
  }
}

// ─── Upstash / KV-backed limiter (production) ────────────────────────────────

async function createUpstashLimiter(max: number, windowSeconds: number) {
  const { Ratelimit } = await import("@upstash/ratelimit")
  const { Redis } = await import("@upstash/redis")

  const window = `${windowSeconds} s` as `${number} s`
  return new Ratelimit({
    redis: new Redis({
      url: process.env.KV_REST_API_URL!,
      token: process.env.KV_REST_API_TOKEN!,
    }),
    limiter: Ratelimit.slidingWindow(max, window),
    analytics: false,
  })
}

// ─── Unified limiter factory ──────────────────────────────────────────────────

type UpstashLimiter = Awaited<ReturnType<typeof createUpstashLimiter>>

class Limiter {
  private upstash: UpstashLimiter | null = null
  private memory: InMemoryRatelimit

  constructor(
    private readonly max: number,
    private readonly windowSeconds: number,
  ) {
    this.memory = new InMemoryRatelimit(max, windowSeconds * 1000)
  }

  private async getUpstash(): Promise<UpstashLimiter | null> {
    if (!process.env.KV_REST_API_URL || !process.env.KV_REST_API_TOKEN) return null
    if (!this.upstash) {
      this.upstash = await createUpstashLimiter(this.max, this.windowSeconds)
    }
    return this.upstash
  }

  async limit(identifier: string): Promise<RateLimitResult> {
    const upstash = await this.getUpstash()
    if (upstash) {
      const result = await upstash.limit(identifier)
      return {
        success: result.success,
        limit: result.limit,
        remaining: result.remaining,
        reset: Math.ceil(result.reset / 1000),
      }
    }
    return this.memory.limit(identifier)
  }
}

// ─── Per-endpoint limiters ────────────────────────────────────────────────────

/** 5 requests/hour per IP for email subscribe */
export const subscribeRatelimit = new Limiter(5, 3600)

/** 3 requests/hour per IP for sponsor applications */
export const sponsorsRatelimit = new Limiter(3, 3600)

/** 10 requests/hour per IP for admin login */
export const adminLoginRatelimit = new Limiter(10, 3600)

// ─── Admin consecutive-failure lockout ───────────────────────────────────────

interface LockoutEntry {
  consecutiveFailures: number
  lockedUntil: number | null // ms timestamp
}

const lockoutStore = new Map<string, LockoutEntry>()
const MAX_CONSECUTIVE_FAILURES = 5
const LOCKOUT_DURATION_MS = 60 * 60 * 1000 // 1 hour

export function checkAdminLockout(ip: string): { locked: boolean; retryAfter?: number } {
  const entry = lockoutStore.get(ip)
  if (!entry) return { locked: false }

  if (entry.lockedUntil && Date.now() < entry.lockedUntil) {
    const retryAfter = Math.ceil((entry.lockedUntil - Date.now()) / 1000)
    return { locked: true, retryAfter }
  }

  // Lock expired — clear it
  if (entry.lockedUntil && Date.now() >= entry.lockedUntil) {
    lockoutStore.delete(ip)
  }

  return { locked: false }
}

export function recordAdminLoginFailure(ip: string): void {
  const entry = lockoutStore.get(ip) ?? { consecutiveFailures: 0, lockedUntil: null }
  entry.consecutiveFailures += 1
  if (entry.consecutiveFailures >= MAX_CONSECUTIVE_FAILURES) {
    entry.lockedUntil = Date.now() + LOCKOUT_DURATION_MS
  }
  lockoutStore.set(ip, entry)
}

export function recordAdminLoginSuccess(ip: string): void {
  lockoutStore.delete(ip)
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Extract client IP from a Next.js request, honouring standard proxy headers. */
export function getClientIp(req: Request): string {
  const forwarded = (req.headers as Headers).get("x-forwarded-for")
  if (forwarded) return forwarded.split(",")[0].trim()
  return "unknown"
}
