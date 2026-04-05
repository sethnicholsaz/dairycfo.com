import { NextRequest, NextResponse } from "next/server"
import { createServiceClient } from "@/lib/supabase/server"
import { createSubscriberToken, COOKIE_NAME } from "@/lib/subscriber"

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

    // Set cookie on the response (cookies() from next/headers doesn't work in Route Handlers)
    const token = await createSubscriberToken(subscriber.id, subscriber.email)
    const response = NextResponse.json({ success: true })
    response.cookies.set(COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 365,
      path: "/",
    })
    return response
  } catch (err) {
    console.error("Subscribe route error:", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
