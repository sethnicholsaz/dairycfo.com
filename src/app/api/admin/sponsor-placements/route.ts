import { NextRequest, NextResponse } from "next/server"
import { createServiceClient } from "@/lib/supabase/server"

export async function POST(req: NextRequest) {
  const { sponsor_id, newsletter_id, position } = await req.json()

  if (!sponsor_id || !newsletter_id) {
    return NextResponse.json({ error: "sponsor_id and newsletter_id required" }, { status: 400 })
  }

  const supabase = await createServiceClient()

  const { error } = await supabase.from("sponsor_placements").insert({
    sponsor_id,
    newsletter_id,
    position: position ?? "body",
  })

  if (error) {
    return NextResponse.json({ error: "Failed to assign sponsor" }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
