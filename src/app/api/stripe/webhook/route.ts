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

        // Subscription checkout — subscription events will follow; nothing to do here
        break
      }

      // ── Subscription lifecycle ─────────────────────────────────────────
      case "customer.subscription.created":
      case "customer.subscription.updated": {
        const sub = event.data.object as Stripe.Subscription
        await upsertSubscription(supabase, sub)
        break
      }

      case "customer.subscription.deleted": {
        const sub = event.data.object as Stripe.Subscription
        await supabase
          .from("subscriptions")
          .update({
            status: "canceled",
            canceled_at: new Date().toISOString(),
          })
          .eq("stripe_subscription_id", sub.id)
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

async function upsertSubscription(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: any,
  sub: Stripe.Subscription
) {
  const customerId = typeof sub.customer === "string" ? sub.customer : sub.customer.id

  // Resolve subscriber_id from stripe_customer_id
  const { data: subscriber } = await supabase
    .from("subscribers")
    .select("id")
    .eq("stripe_customer_id", customerId)
    .single()

  if (!subscriber) {
    console.warn(`No subscriber found for Stripe customer ${customerId}`)
    Sentry.captureMessage(`No subscriber found for Stripe customer ${customerId}`, {
      level: "warning",
      tags: { webhook: "stripe", failure_type: "missing_subscriber" },
      extra: { customerId, subscriptionId: sub.id },
    })
    return
  }

  const item = sub.items.data[0]
  const interval = item?.plan?.interval ?? null

  // In Stripe API 2025-02-24.acacia, current_period_end lives on the SubscriptionItem
  const periodEnd = item?.current_period_end ?? null

  // Derive plan from price metadata or nickname
  const plan = derivePlan(item?.price?.id)

  await supabase
    .from("subscriptions")
    .upsert(
      {
        subscriber_id: subscriber.id,
        stripe_subscription_id: sub.id,
        stripe_customer_id: customerId,
        plan,
        billing_interval: interval,
        status: sub.status,
        current_period_end: periodEnd ? new Date(periodEnd * 1000).toISOString() : null,
        cancel_at_period_end: sub.cancel_at_period_end,
        canceled_at: sub.canceled_at ? new Date(sub.canceled_at * 1000).toISOString() : null,
      },
      { onConflict: "stripe_subscription_id" }
    )
}

function derivePlan(priceId: string | undefined): string {
  if (!priceId) return "free"
  if (priceId === env.STRIPE_PRICE_TEAM_MONTHLY) return "team"
  if (priceId === env.STRIPE_PRICE_PRO_MONTHLY) return "pro"
  if (priceId === env.STRIPE_PRICE_PRO_ANNUAL) return "pro"
  return "pro" // unknown price — default to pro
}
