import { NextRequest, NextResponse } from "next/server"
import { stripe } from "@/lib/stripe"
import { createServiceClient } from "@/lib/supabase/server"
import { getSubscriberFromCookie } from "@/lib/subscriber"
import { STRIPE_PRICES } from "@/lib/subscription"

const VALID_PRICES = new Set(Object.values(STRIPE_PRICES))

export async function POST(req: NextRequest) {
  const subscriber = await getSubscriberFromCookie()
  if (!subscriber) {
    return NextResponse.json({ error: "Not subscribed — sign up for the free newsletter first." }, { status: 401 })
  }

  const { priceId } = await req.json()
  if (!priceId || !VALID_PRICES.has(priceId)) {
    return NextResponse.json({ error: "Invalid price" }, { status: 400 })
  }

  const supabase = await createServiceClient()
  const { data: sub } = await supabase
    .from("subscribers")
    .select("id, email, name, stripe_customer_id")
    .eq("id", subscriber.sub)
    .single()

  if (!sub) {
    return NextResponse.json({ error: "Subscriber not found" }, { status: 404 })
  }

  // Reuse or create Stripe customer
  let customerId = sub.stripe_customer_id
  if (!customerId) {
    const customer = await stripe.customers.create({
      email: sub.email,
      name: sub.name ?? undefined,
      metadata: { subscriber_id: sub.id },
    })
    customerId = customer.id
    await supabase
      .from("subscribers")
      .update({ stripe_customer_id: customerId })
      .eq("id", sub.id)
  }

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer: customerId,
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${req.nextUrl.origin}/account?upgraded=1`,
    cancel_url: `${req.nextUrl.origin}/pricing`,
    allow_promotion_codes: true,
    metadata: { subscriber_id: sub.id },
  })

  return NextResponse.json({ url: session.url })
}
