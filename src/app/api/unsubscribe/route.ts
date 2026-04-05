import { NextRequest, NextResponse } from "next/server"
import { createServiceClient } from "@/lib/supabase/server"

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token")

  if (!token) {
    return NextResponse.json({ error: "Missing token" }, { status: 400 })
  }

  try {
    const supabase = await createServiceClient()
    const { error } = await supabase
      .from("subscribers")
      .update({ unsubscribed_at: new Date().toISOString() })
      .eq("unsubscribe_token", token)
      .is("unsubscribed_at", null)

    if (error) throw error

    // Redirect to unsubscribe confirmation page
    return NextResponse.redirect(new URL("/unsubscribe?confirmed=1", req.url))
  } catch (err) {
    console.error("Unsubscribe error:", err)
    return NextResponse.json({ error: "Failed to unsubscribe" }, { status: 500 })
  }
}
