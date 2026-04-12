import { NextRequest, NextResponse } from "next/server"
import { createServiceClient } from "@/lib/supabase/server"
import { renderNewsletterEmail } from "@/lib/email-renderer"

interface Params {
  params: Promise<{ id: string }>
}

export async function GET(_req: NextRequest, { params }: Params) {
  const { id } = await params
  const supabase = await createServiceClient()

  const { data: newsletter } = await supabase
    .from("newsletters")
    .select("*, sponsor_placements(*, sponsors(*))")
    .eq("id", id)
    .single()

  if (!newsletter) {
    return NextResponse.json({ error: "Newsletter not found" }, { status: 404 })
  }

  const { data: marketData } = await supabase
    .from("market_data")
    .select("*")
    .order("data_date", { ascending: false })
    .limit(1)
    .single()

  const confirmedPlacement = (newsletter.sponsor_placements as any[])?.find(
    (p: any) => p.status === "confirmed"
  )
  const sponsor = confirmedPlacement?.sponsors

  const html = await renderNewsletterEmail(
    newsletter.mdx_content ?? "",
    marketData ?? null,
    "#unsubscribe",
    {
      title: newsletter.title,
      issueNumber: newsletter.issue_number,
      publishedAt: newsletter.published_at,
      sponsorName: sponsor?.name ?? "",
      sponsorMessage: sponsor?.tagline ?? "",
      sponsorUrl: sponsor?.website_url ?? "",
    }
  )

  return new NextResponse(html, {
    headers: { "Content-Type": "text/html; charset=utf-8" },
  })
}
