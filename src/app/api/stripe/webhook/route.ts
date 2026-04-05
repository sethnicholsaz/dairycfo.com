import { NextRequest, NextResponse } from "next/server"
import { stripe } from "@/lib/stripe"
import { createServiceClient } from "@/lib/supabase/server"
import type Stripe from "stripe"

export async function POST(req: NextRequest) {
  const body = await req.text()
  const sig = req.headers.get("stripe-signature")!
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret)
  } catch (err) {
    console.error("Webhook signature verification failed:", err)
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 })
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session
    const sponsorId = session.metadata?.sponsor_id

    if (!sponsorId) {
      return NextResponse.json({ received: true })
    }

    const supabase = await createServiceClient()
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

  return NextResponse.json({ received: true })
}
