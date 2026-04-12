import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { jwtVerify } from "jose"
import { env } from "@/lib/env"

const SECRET = new TextEncoder().encode(env.SUBSCRIBER_JWT_SECRET)

const ADMIN_SECRET = env.ADMIN_SECRET

// Routes that require subscriber cookie
const SUBSCRIBER_ROUTES = ["/newsletters"]

// Routes that require admin access
const ADMIN_ROUTES = ["/admin"]

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Admin protection
  if (ADMIN_ROUTES.some((r) => pathname.startsWith(r)) && pathname !== "/admin/login") {
    const adminToken = request.cookies.get("dcfo_admin")?.value
    if (!adminToken || adminToken !== ADMIN_SECRET) {
      const loginUrl = new URL("/admin/login", request.url)
      loginUrl.searchParams.set("redirect", pathname)
      return NextResponse.redirect(loginUrl)
    }
    return NextResponse.next()
  }

  // Subscriber protection
  if (SUBSCRIBER_ROUTES.some((r) => pathname.startsWith(r))) {
    const subscriberToken = request.cookies.get("dcfo_subscriber")?.value
    if (!subscriberToken) {
      const subscribeUrl = new URL("/subscribe", request.url)
      subscribeUrl.searchParams.set("redirect", pathname)
      return NextResponse.redirect(subscribeUrl)
    }

    try {
      await jwtVerify(subscriberToken, SECRET)
      return NextResponse.next()
    } catch {
      const subscribeUrl = new URL("/subscribe", request.url)
      subscribeUrl.searchParams.set("redirect", pathname)
      const response = NextResponse.redirect(subscribeUrl)
      response.cookies.delete("dcfo_subscriber")
      return response
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/newsletters/:path*", "/admin/:path*"],
}
