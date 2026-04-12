import { NextRequest, NextResponse } from "next/server"
import { env } from "@/lib/env"

export async function POST(req: NextRequest) {
  const { password } = await req.json()

  if (password !== env.ADMIN_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

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
