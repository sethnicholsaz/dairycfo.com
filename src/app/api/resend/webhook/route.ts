import { NextRequest, NextResponse } from "next/server"
import * as Sentry from "@sentry/nextjs"
import { resend } from "@/lib/resend"
import { createServiceClient } from "@/lib/supabase/server"
import { env } from "@/lib/env"

export async function POST(req: NextRequest) {
  const payload = await req.text()

  // Verify webhook signature
  let event: ReturnType<typeof resend.webhooks.verify>
  try {
    event = resend.webhooks.verify({
      payload,
      headers: {
        id: req.headers.get("svix-id") ?? "",
        timestamp: req.headers.get("svix-timestamp") ?? "",
        signature: req.headers.get("svix-signature") ?? "",
      },
      webhookSecret: env.RESEND_WEBHOOK_SECRET,
    })
  } catch (err) {
    Sentry.captureException(err, {
      tags: { webhook: "resend", failure_type: "signature_verification" },
    })
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 })
  }

  const supabase = await createServiceClient()

  Sentry.setTag("resend_event_type", event.type)

  try {
    // Hard bounce — mark unsubscribed so we stop trying
    if (event.type === "email.bounced") {
      const email = (event.data as { to?: string[] }).to?.[0]
      if (email) {
        await supabase
          .from("subscribers")
          .update({ unsubscribed_at: new Date().toISOString() })
          .eq("email", email)
          .is("unsubscribed_at", null)
      }
    }

    // Spam complaint — immediately unsubscribe
    if (event.type === "email.complained") {
      const email = (event.data as { to?: string[] }).to?.[0]
      if (email) {
        await supabase
          .from("subscribers")
          .update({ unsubscribed_at: new Date().toISOString() })
          .eq("email", email)
          .is("unsubscribed_at", null)
      }
    }

    // Contact updated — check if they unsubscribed via Resend's unsubscribe link
    if (event.type === "contact.updated") {
      const data = event.data as { email?: string; unsubscribed?: boolean }
      if (data.email && data.unsubscribed === true) {
        await supabase
          .from("subscribers")
          .update({ unsubscribed_at: new Date().toISOString() })
          .eq("email", data.email)
          .is("unsubscribed_at", null)
      }
    }

    // Open/click analytics — store events linked to newsletters via broadcast_id
    if (event.type === "email.opened" || event.type === "email.clicked") {
      const data = event.data as {
        broadcast_id?: string
        email_id: string
        to: string[]
        created_at: string
      }
      const email = data.to?.[0]
      const broadcastId = data.broadcast_id

      if (email && broadcastId) {
        const { data: newsletter } = await supabase
          .from("newsletters")
          .select("id")
          .eq("broadcast_id", broadcastId)
          .single()

        if (newsletter) {
          await supabase.from("newsletter_analytics").upsert(
            {
              newsletter_id: newsletter.id,
              event_type: event.type,
              email,
              timestamp: data.created_at,
            },
            { onConflict: "newsletter_id,event_type,email", ignoreDuplicates: true }
          )
        }
      }
    }
  } catch (err) {
    console.error("Resend webhook handler error:", err)
    Sentry.captureException(err, {
      tags: { webhook: "resend", resend_event_type: event.type },
    })
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 })
  }

  return NextResponse.json({ received: true })
}
