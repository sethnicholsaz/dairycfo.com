import { NextRequest, NextResponse } from "next/server"
import * as Sentry from "@sentry/nextjs"
import { stripe } from "@/lib/stripe"
import { createServiceClient } from "@/lib/supabase/server"
import { env } from "@/lib/env"
import type Stripe from "stripe"

export async function POST(req: NextRequest) {
  const body = await req.text()
  const sig = req.headers.get("stripe-signature")!
  const webhookSecret = env.STRIPE_WEBHOOK_SECRET

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret)
  } catch (err) {
    console.error("Webhook signature verification failed:", err)
    Sentry.captureException(err, {
      tags: { webhook: "stripe", failure_type: "signature_verification" },
    })
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 })
  }

  const supabase = await createServiceClient()

  Sentry.setTag("stripe_event_type", event.type)

  try {
    switch (event.type) {
      // ── One-time sponsor payments ──────────────────────────────────────
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session
        const sponsorId = session.metadata?.sponsor_id

        if (sponsorId) {
          await supabase
            .from("sponsors")
            .update({
              status: "paid",
              stripe_payment_intent_id: session.payment_intent as string,
              paid_amount_cents: session.amount_total,
              paid_at: new Date().toISOString(),
            })
            .eq("id", sponsorId)
        }
        break
      }
    }
  } catch (err) {
    console.error("Stripe webhook handler error:", err)
    Sentry.captureException(err, {
      tags: { webhook: "stripe", stripe_event_type: event.type },
      extra: { eventId: event.id },
    })
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 })
  }

  return NextResponse.json({ received: true })
}
