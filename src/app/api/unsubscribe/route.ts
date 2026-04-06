import { NextRequest, NextResponse } from "next/server"
import { createServiceClient } from "@/lib/supabase/server"
import { unsubscribeResendContact } from "@/lib/resend"

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token")

  if (!token) {
    return NextResponse.json({ error: "Missing token" }, { status: 400 })
  }

  try {
    const supabase = await createServiceClient()
    const { data: subscriber, error } = await supabase
      .from("subscribers")
      .update({ unsubscribed_at: new Date().toISOString() })
      .eq("unsubscribe_token", token)
      .is("unsubscribed_at", null)
      .select("email")
      .single()

    if (error) throw error

    // Sync unsubscribe to Resend (non-blocking)
    if (subscriber?.email) {
      void unsubscribeResendContact(subscriber.email)
    }

    return NextResponse.redirect(new URL("/unsubscribe?confirmed=1", req.url))
  } catch (err) {
    console.error("Unsubscribe error:", err)
    return NextResponse.json({ error: "Failed to unsubscribe" }, { status: 500 })
  }
}
