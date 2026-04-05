import { notFound } from "next/navigation"
import Link from "next/link"
import { SiteNav } from "@/components/layout/SiteNav"
import { SiteFooter } from "@/components/layout/SiteFooter"
import { createClient } from "@/lib/supabase/server"
import { NewsletterRenderer } from "@/components/newsletter/NewsletterRenderer"
import { ArrowLeft, ArrowRight } from "lucide-react"

interface Props {
  params: Promise<{ slug: string }>
}

async function getNewsletter(slug: string) {
  const supabase = await createClient()
  const { data } = await supabase
    .from("newsletters")
    .select("*")
    .eq("slug", slug)
    .not("published_at", "is", null)
    .lte("published_at", new Date().toISOString())
    .single()
  return data
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params
  const newsletter = await getNewsletter(slug)
  if (!newsletter) return { title: "Not Found" }
  return { title: `${newsletter.title} | DairyCFO`, description: newsletter.excerpt }
}

export default async function NewsletterPage({ params }: Props) {
  const { slug } = await params
  const newsletter = await getNewsletter(slug)
  if (!newsletter) notFound()

  return (
    <div className="flex flex-col min-h-screen" style={{ background: "#fdfcf9" }}>
      <SiteNav />

      <main className="flex-1">
        <section style={{ paddingTop: "120px", paddingBottom: "56px", background: "#ffffff", borderBottom: "1px solid #d8d2be" }}>
          <div className="max-w-3xl mx-auto px-6">
            <Link href="/newsletters" className="link-hover inline-flex items-center gap-1.5 text-sm font-medium mb-8" style={{ color: "#8a9080" }}>
              <ArrowLeft size={14} /> All issues
            </Link>
            <div className="flex items-center gap-3 mb-5">
              {newsletter.issue_number && (
                <span className="text-xs font-semibold px-3 py-1 rounded-full" style={{ background: "#e8f5ec", color: "#1c4a2a" }}>
                  Issue #{newsletter.issue_number}
                </span>
              )}
              {newsletter.published_at && (
                <span className="text-sm" style={{ color: "#8a9080" }}>
                  {new Date(newsletter.published_at).toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}
                </span>
              )}
            </div>
            <h1 className="font-bold tracking-tight mb-4" style={{ fontSize: "clamp(1.875rem, 4vw, 2.75rem)", color: "#111410", letterSpacing: "-0.025em", lineHeight: 1.15 }}>
              {newsletter.title}
            </h1>
            {newsletter.excerpt && (
              <p className="leading-relaxed" style={{ color: "#4a5046", fontSize: "1.125rem", maxWidth: "540px" }}>{newsletter.excerpt}</p>
            )}
          </div>
        </section>

        <div className="max-w-3xl mx-auto px-6 py-12">
          <NewsletterRenderer content={newsletter.mdx_content} newsletterId={newsletter.id} />
        </div>

        <div style={{ borderTop: "1px solid #d8d2be", background: "#ffffff" }}>
          <div className="max-w-3xl mx-auto px-6 py-8 flex items-center justify-between">
            <Link href="/newsletters" className="link-hover inline-flex items-center gap-1.5 text-sm font-medium" style={{ color: "#4a5046" }}>
              <ArrowLeft size={14} /> All issues
            </Link>
            <Link href="/subscribe" className="link-green-hover inline-flex items-center gap-1.5 text-sm font-medium" style={{ color: "#1c4a2a" }}>
              Forward to a colleague <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  )
}
