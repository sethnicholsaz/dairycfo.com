import { NextRequest, NextResponse } from "next/server"
import { braveSearch, SearchResult } from "@/lib/brave-search"
import { env } from "@/lib/env"

export async function POST(req: NextRequest) {
  const authHeader = req.headers.get("authorization")
  const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null
  if (token !== env.ADMIN_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  if (!env.BRAVE_API_KEY) {
    return NextResponse.json(
      { error: "Search is not available: BRAVE_API_KEY is not configured" },
      { status: 503 }
    )
  }

  let body: { query?: string; count?: number }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 })
  }

  const { query, count } = body
  if (!query || typeof query !== "string") {
    return NextResponse.json({ error: "query is required" }, { status: 400 })
  }

  try {
    const results: SearchResult[] = await braveSearch(query, { count })
    return NextResponse.json({ results })
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error("Brave search error:", msg)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
