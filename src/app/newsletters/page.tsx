import Link from "next/link"
import { SiteNav } from "@/components/layout/SiteNav"
import { SiteFooter } from "@/components/layout/SiteFooter"
import { createClient } from "@/lib/supabase/server"
import { ArrowRight } from "lucide-react"

async function getNewsletters() {
  const supabase = await createClient()
  const { data } = await supabase
    .from("newsletters")
    .select("id, title, slug, excerpt, issue_number, published_at")
    .not("published_at", "is", null)
    .lte("published_at", new Date().toISOString())
    .order("published_at", { ascending: false })
  return data ?? []
}

export default async function NewslettersPage() {
  const newsletters = await getNewsletters()

  return (
    <div className="flex flex-col min-h-screen" style={{ background: "#fdfcf9" }}>
      <SiteNav />

      <section style={{ paddingTop: "120px", paddingBottom: "56px" }}>
        <div className="max-w-7xl mx-auto px-6">
          <p className="text-sm font-medium mb-4" style={{ color: "#c8902a", letterSpacing: "0.06em", textTransform: "uppercase" }}>Archive</p>
          <h1 className="font-bold tracking-tight mb-3" style={{ fontSize: "clamp(2.5rem, 5vw, 3.5rem)", color: "#111410", letterSpacing: "-0.03em", lineHeight: 1.1 }}>
            Every issue.
          </h1>
          <p style={{ color: "#4a5046", fontSize: "1.0625rem" }}>
            {newsletters.length > 0
              ? `${newsletters.length} issue${newsletters.length > 1 ? "s" : ""} published.`
              : "First issue coming soon."}
          </p>
        </div>
      </section>

      <main className="flex-1">
        <div className="max-w-7xl mx-auto px-6 pb-20">
          {newsletters.length === 0 ? (
            <div className="rounded-2xl p-16 text-center bg-white border border-cream-400">
              <p className="font-semibold mb-2 text-ink-900">First issue coming soon</p>
              <p className="text-sm text-ink-500">Subscribe to be notified when we publish.</p>
              <Link href="/subscribe" className="inline-flex items-center gap-2 mt-6 h-9 px-5 rounded-full text-sm font-semibold bg-green-800 text-white hover:bg-green-700 transition-colors">
                Subscribe free <ArrowRight size={13} />
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {newsletters.map((n) => (
                <Link
                  key={n.id}
                  href={`/newsletters/${n.slug}`}
                  className="card-hover group flex items-center justify-between gap-6 rounded-2xl p-6"
                  style={{ background: "#ffffff", border: "1px solid #d8d2be" }}
                >
                  <div className="flex items-center gap-5 min-w-0">
                    {n.issue_number && (
                      <span className="shrink-0 text-xs font-semibold w-10 h-10 rounded-full flex items-center justify-center" style={{ background: "#e8f5ec", color: "#1c4a2a" }}>
                        #{n.issue_number}
                      </span>
                    )}
                    <div className="min-w-0">
                      <p className="font-semibold truncate" style={{ color: "#111410", letterSpacing: "-0.01em" }}>{n.title}</p>
                      {n.excerpt && <p className="text-sm truncate mt-0.5" style={{ color: "#4a5046" }}>{n.excerpt}</p>}
                    </div>
                  </div>
                  <div className="flex items-center gap-4 shrink-0">
                    {n.published_at && (
                      <span className="hidden md:block text-sm" style={{ color: "#8a9080" }}>
                        {new Date(n.published_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                      </span>
                    )}
                    <ArrowRight size={16} style={{ color: "#c8cec0" }} />
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>

      <SiteFooter />
    </div>
  )
}
