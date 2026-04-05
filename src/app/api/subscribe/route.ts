import { NextRequest, NextResponse } from "next/server"
import { createServiceClient } from "@/lib/supabase/server"
import { setSubscriberCookie } from "@/lib/subscriber"

export async function POST(req: NextRequest) {
  try {
    const { email, name } = await req.json()

    if (!email || typeof email !== "string") {
      return NextResponse.json({ error: "Email is required" }, { status: 400 })
    }

    const emailLower = email.toLowerCase().trim()
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailLower)) {
      return NextResponse.json({ error: "Invalid email address" }, { status: 400 })
    }

    const supabase = await createServiceClient()

    // Upsert subscriber (handles re-subscribes)
    const { data: subscriber, error } = await supabase
      .from("subscribers")
      .upsert(
        {
          email: emailLower,
          name: name?.trim() || null,
          unsubscribed_at: null, // re-subscribe if previously unsubscribed
        },
        {
          onConflict: "email",
          ignoreDuplicates: false,
        }
      )
      .select("id, email")
      .single()

    if (error) {
      console.error("Subscribe error:", error)
      return NextResponse.json({ error: "Failed to subscribe" }, { status: 500 })
    }

    // Set cookie for immediate access
    await setSubscriberCookie(subscriber.id, subscriber.email)

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error("Subscribe route error:", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
