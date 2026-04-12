import { NextRequest, NextResponse } from "next/server"
import { createServiceClient } from "@/lib/supabase/server"
import { stripe } from "@/lib/stripe"
import { env } from "@/lib/env"
import { sponsorsRatelimit, getClientIp } from "@/lib/ratelimit"

const SPONSOR_PRICE_CENTS = env.SPONSOR_PRICE_CENTS
const ARTWORK_MAX_BYTES = 5 * 1024 * 1024 // 5MB

export async function POST(req: NextRequest) {
  const ip = getClientIp(req)
  const rl = await sponsorsRatelimit.limit(ip)
  if (!rl.success) {
    return NextResponse.json(
      { error: "Too many requests. Please try again later." },
      {
        status: 429,
        headers: {
          "Retry-After": String(rl.reset - Math.floor(Date.now() / 1000)),
          "X-RateLimit-Limit": String(rl.limit),
          "X-RateLimit-Remaining": "0",
          "X-RateLimit-Reset": String(rl.reset),
        },
      },
    )
  }

  try {
    const fd = await req.formData()

    const company = (fd.get("company") as string)?.trim()
    const contact_name = (fd.get("contact_name") as string)?.trim() || null
    const contact_email = (fd.get("contact_email") as string)?.trim()
    const website = (fd.get("website") as string)?.trim() || null
    const desired_newsletter = (fd.get("desired_newsletter") as string)?.trim() || null
    const message = (fd.get("message") as string)?.trim() || null
    const artwork = fd.get("artwork") as File | null

    if (!company || !contact_email) {
      return NextResponse.json({ error: "Company and email are required" }, { status: 400 })
    }

    const supabase = await createServiceClient()
    let artwork_url: string | null = null
    let artwork_filename: string | null = null

    // Upload artwork if provided
    if (artwork && artwork.size > 0) {
      if (artwork.size > ARTWORK_MAX_BYTES) {
        return NextResponse.json({ error: "Artwork must be under 5MB" }, { status: 400 })
      }

      const ext = artwork.name.split(".").pop()
      const filename = `sponsors/${Date.now()}-${company.replace(/[^a-z0-9]/gi, "_").toLowerCase()}.${ext}`
      const buffer = Buffer.from(await artwork.arrayBuffer())

      const { error: uploadError } = await supabase.storage
        .from("sponsor-artwork")
        .upload(filename, buffer, {
          contentType: artwork.type,
          upsert: false,
        })

      if (!uploadError) {
        const { data: urlData } = supabase.storage
          .from("sponsor-artwork")
          .getPublicUrl(filename)
        artwork_url = urlData.publicUrl
        artwork_filename = artwork.name
      }
    }

    // Save sponsor record
    const { data: sponsor, error: dbError } = await supabase
      .from("sponsors")
      .insert({
        company,
        contact_name,
        contact_email,
        website,
        desired_newsletter,
        message,
        artwork_url,
        artwork_filename,
        status: "pending",
      })
      .select("id")
      .single()

    if (dbError || !sponsor) {
      console.error("Sponsor insert error:", dbError)
      return NextResponse.json({ error: "Failed to save request" }, { status: 500 })
    }

    // Create Stripe Checkout session
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            unit_amount: SPONSOR_PRICE_CENTS,
            product_data: {
              name: `DairyCFO Newsletter Sponsorship`,
              description: desired_newsletter
                ? `Sponsorship placement: ${desired_newsletter}`
                : "Newsletter sponsorship placement",
            },
          },
          quantity: 1,
        },
      ],
      customer_email: contact_email,
      metadata: {
        sponsor_id: sponsor.id,
      },
      success_url: `${req.nextUrl.origin}/sponsors/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.nextUrl.origin}/sponsors`,
    })

    // Save session ID
    await supabase
      .from("sponsors")
      .update({ stripe_checkout_session_id: session.id })
      .eq("id", sponsor.id)

    return NextResponse.json({ checkoutUrl: session.url })
  } catch (err) {
    console.error("Sponsor route error:", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
