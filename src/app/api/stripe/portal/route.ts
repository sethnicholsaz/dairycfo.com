import { NextRequest, NextResponse } from "next/server"
import { stripe } from "@/lib/stripe"
import { createServiceClient } from "@/lib/supabase/server"
import { getSubscriberFromCookie } from "@/lib/subscriber"

export async function POST(req: NextRequest) {
  const subscriber = await getSubscriberFromCookie()
  if (!subscriber) {
    return NextResponse.json({ error: "Not logged in" }, { status: 401 })
  }

  const supabase = await createServiceClient()
  const { data: sub } = await supabase
    .from("subscribers")
    .select("stripe_customer_id")
    .eq("id", subscriber.sub)
    .single()

  if (!sub?.stripe_customer_id) {
    return NextResponse.json({ error: "No billing account found" }, { status: 404 })
  }

  const session = await stripe.billingPortal.sessions.create({
    customer: sub.stripe_customer_id,
    return_url: `${req.nextUrl.origin}/account`,
  })

  return NextResponse.json({ url: session.url })
}
