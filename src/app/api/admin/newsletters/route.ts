import { NextRequest, NextResponse } from "next/server"
import { createServiceClient } from "@/lib/supabase/server"
import { resend, FROM_EMAIL } from "@/lib/resend"
import { renderNewsletterEmail } from "@/lib/email-renderer"

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { title, slug, excerpt, issue_number, mdx_content } = body

  if (!title || !slug) {
    return NextResponse.json({ error: "Title and slug are required" }, { status: 400 })
  }

  const supabase = await createServiceClient()

  const { data, error } = await supabase
    .from("newsletters")
    .insert({
      title,
      slug,
      excerpt: excerpt || null,
      issue_number: issue_number || null,
      mdx_content: mdx_content || "",
      published_at: body.publish ? new Date().toISOString() : null,
    })
    .select("id")
    .single()

  if (error) {
    if (error.code === "23505") {
      return NextResponse.json({ error: "Slug already exists — choose a unique slug" }, { status: 409 })
    }
    console.error("Create newsletter error:", error)
    return NextResponse.json({ error: "Failed to create newsletter" }, { status: 500 })
  }

  return NextResponse.json({ id: data.id })
}

export async function GET() {
  const supabase = await createServiceClient()
  const { data, error } = await supabase
    .from("newsletters")
    .select("id, title, slug, issue_number, published_at, sent_at, created_at")
    .order("created_at", { ascending: false })

  if (error) {
    return NextResponse.json({ error: "Failed to fetch newsletters" }, { status: 500 })
  }

  return NextResponse.json(data)
}
