import { NextRequest, NextResponse } from "next/server"
import { createServiceClient } from "@/lib/supabase/server"
import { resend, FROM_EMAIL, REPLY_TO } from "@/lib/resend"
import { renderNewsletterEmail } from "@/lib/email-renderer"

interface Params {
  params: Promise<{ id: string }>
}

export async function PATCH(req: NextRequest, { params }: Params) {
  const { id } = await params
  const body = await req.json()
  const { title, slug, excerpt, issue_number, mdx_content, publish, send } = body

  if (!title || !slug) {
    return NextResponse.json({ error: "Title and slug required" }, { status: 400 })
  }

  const supabase = await createServiceClient()

  // Fetch current state
  const { data: existing } = await supabase
    .from("newsletters")
    .select("*")
    .eq("id", id)
    .single()

  if (!existing) {
    return NextResponse.json({ error: "Newsletter not found" }, { status: 404 })
  }

  const updates: Record<string, unknown> = {
    title,
    slug,
    excerpt: excerpt || null,
    issue_number: issue_number || null,
    mdx_content: mdx_content || "",
  }

  if (publish && !existing.published_at) {
    updates.published_at = new Date().toISOString()
  }

  const { error: updateError } = await supabase
    .from("newsletters")
    .update(updates)
    .eq("id", id)

  if (updateError) {
    if (updateError.code === "23505") {
      return NextResponse.json({ error: "Slug already in use" }, { status: 409 })
    }
    return NextResponse.json({ error: "Update failed" }, { status: 500 })
  }

  // Send newsletter to all subscribers
  if (send && !existing.sent_at) {
    // Get active subscribers
    const { data: subscribers } = await supabase
      .from("subscribers")
      .select("id, email, name, unsubscribe_token")
      .is("unsubscribed_at", null)

    if (!subscribers || subscribers.length === 0) {
      return NextResponse.json({ error: "No active subscribers to send to" }, { status: 400 })
    }

    // Get latest market data for email
    const { data: marketData } = await supabase
      .from("market_data")
      .select("*")
      .order("data_date", { ascending: false })
      .limit(1)
      .single()

    let sentCount = 0
    const batchSize = 50 // Resend batch limit

    for (let i = 0; i < subscribers.length; i += batchSize) {
      const batch = subscribers.slice(i, i + batchSize)

      await Promise.allSettled(
        batch.map(async (sub) => {
          const unsubscribeUrl = `https://dairycfo.com/api/unsubscribe?token=${sub.unsubscribe_token}`
          const html = await renderNewsletterEmail(mdx_content, marketData ?? null, unsubscribeUrl)

          await resend.emails.send({
            from: FROM_EMAIL,
            to: sub.email,
            replyTo: REPLY_TO,
            subject: `${title}${issue_number ? ` — Issue #${issue_number}` : ""}`,
            html,
          })
          sentCount++
        })
      )
    }

    // Mark as sent
    await supabase
      .from("newsletters")
      .update({ sent_at: new Date().toISOString() })
      .eq("id", id)

    return NextResponse.json({ success: true, sentCount })
  }

  return NextResponse.json({ success: true })
}
