import { NextRequest, NextResponse } from "next/server"
import { env } from "@/lib/env"
import {
  adminLoginRatelimit,
  checkAdminLockout,
  recordAdminLoginFailure,
  recordAdminLoginSuccess,
  getClientIp,
} from "@/lib/ratelimit"

export async function POST(req: NextRequest) {
  const ip = getClientIp(req)

  // Check consecutive-failure lockout first (cheaper than rate limit check)
  const lockout = checkAdminLockout(ip)
  if (lockout.locked) {
    return NextResponse.json(
      { error: "Account locked due to too many failed attempts. Try again later." },
      {
        status: 429,
        headers: { "Retry-After": String(lockout.retryAfter ?? 3600) },
      },
    )
  }

  // Sliding-window rate limit: 10 requests/hour per IP
  const rl = await adminLoginRatelimit.limit(ip)
  if (!rl.success) {
    return NextResponse.json(
      { error: "Too many requests. Please try again later." },
      {
        status: 429,
        headers: {
          "Retry-After": String(rl.reset - Math.floor(Date.now() / 1000)),
          "X-RateLimit-Limit": String(rl.limit),
          "X-RateLimit-Remaining": "0",
          "X-RateLimit-Reset": String(rl.reset),
        },
      },
    )
  }

  const { password } = await req.json()

  if (password !== env.ADMIN_SECRET) {
    recordAdminLoginFailure(ip)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  recordAdminLoginSuccess(ip)

  const response = NextResponse.json({ success: true })
  response.cookies.set("dcfo_admin", env.ADMIN_SECRET, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 30, // 30 days
    path: "/",
  })

  return response
}
