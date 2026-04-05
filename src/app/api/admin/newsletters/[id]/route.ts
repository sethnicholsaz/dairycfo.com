import { NextRequest, NextResponse } from "next/server"
import { createServiceClient } from "@/lib/supabase/server"
import { resend, FROM_EMAIL, REPLY_TO, AUDIENCE_ID } from "@/lib/resend"
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

  // Send newsletter via Resend Broadcast
  if (send && !existing.sent_at) {
    // Get latest market data and sponsor placement in parallel
    const [{ data: marketData }, { data: sponsorPlacement }] = await Promise.all([
      supabase
        .from("market_data")
        .select("*")
        .order("data_date", { ascending: false })
        .limit(1)
        .single(),
      supabase
        .from("sponsor_placements")
        .select("*, sponsors(*)")
        .eq("newsletter_id", id)
        .eq("status", "confirmed")
        .limit(1)
        .single(),
    ])

    const sponsor = (sponsorPlacement as any)?.sponsors

    // Render HTML using a placeholder unsubscribe URL —
    // Resend replaces {{unsubscribe_url}} automatically in broadcasts
    const html = await renderNewsletterEmail(
      mdx_content,
      marketData ?? null,
      "{{unsubscribe_url}}",
      {
        title,
        issueNumber: issue_number,
        publishedAt: existing.published_at,
        sponsorName: sponsor?.name ?? "",
        sponsorMessage: sponsor?.tagline ?? "",
        sponsorUrl: sponsor?.website_url ?? "",
      }
    )

    const subject = `${title}${issue_number ? ` — Issue #${issue_number}` : ""}`

    // Create broadcast
    const { data: broadcast, error: broadcastError } = await resend.broadcasts.create({
      audienceId: AUDIENCE_ID,
      from: FROM_EMAIL,
      replyTo: REPLY_TO,
      subject,
      html,
      name: subject,
    })

    if (broadcastError || !broadcast) {
      console.error("Broadcast create error:", broadcastError)
      return NextResponse.json({ error: "Failed to create broadcast" }, { status: 500 })
    }

    // Send the broadcast
    const { error: sendError } = await resend.broadcasts.send(broadcast.id)

    if (sendError) {
      console.error("Broadcast send error:", sendError)
      return NextResponse.json({ error: "Failed to send broadcast" }, { status: 500 })
    }

    // Mark as sent and store broadcast ID
    await supabase
      .from("newsletters")
      .update({ sent_at: new Date().toISOString() })
      .eq("id", id)

    return NextResponse.json({ success: true, broadcastId: broadcast.id })
  }

  return NextResponse.json({ success: true })
}
