import Link from "next/link"
import { SiteNav } from "@/components/layout/SiteNav"
import { SiteFooter } from "@/components/layout/SiteFooter"
import { createClient } from "@/lib/supabase/server"
import { SubscribeInlineForm } from "@/components/newsletter/SubscribeInlineForm"
import { ArrowRight } from "lucide-react"

async function getLatestNewsletters() {
  try {
    const supabase = await createClient()
    const { data } = await supabase
      .from("newsletters")
      .select("id, title, slug, excerpt, issue_number, published_at")
      .not("published_at", "is", null)
      .lte("published_at", new Date().toISOString())
      .order("published_at", { ascending: false })
      .limit(3)
    return data ?? []
  } catch {
    return []
  }
}

export default async function HomePage() {
  const newsletters = await getLatestNewsletters()

  return (
    <div className="flex flex-col min-h-screen" style={{ background: "#fdfcf9" }}>
      <SiteNav />

      {/* ─── HERO ─── */}
      <section style={{ paddingTop: "120px", paddingBottom: "96px" }}>
        <div className="max-w-7xl mx-auto px-6">
          <div className="max-w-4xl">
            <div className="inline-flex items-center gap-2 mb-8">
              <div className="w-1.5 h-1.5 rounded-full" style={{ background: "#c8902a" }} />
              <span className="text-sm font-medium" style={{ color: "#4a5046", textTransform: "uppercase", letterSpacing: "0.06em", fontSize: "11px" }}>
                For creamery professionals
              </span>
            </div>

            <h1
              className="font-bold leading-[1.08] tracking-tight mb-8"
              style={{
                fontSize: "clamp(3rem, 7vw, 5.5rem)",
                color: "#111410",
                letterSpacing: "-0.03em",
              }}
            >
              The heartbeat of<br />
              the dairy farm,<br />
              <span style={{ color: "#1c4a2a" }}>delivered weekly.</span>
            </h1>

            <p
              className="mb-10 leading-relaxed"
              style={{ fontSize: "clamp(1.1rem, 2vw, 1.375rem)", color: "#4a5046", maxWidth: "540px", letterSpacing: "-0.01em" }}
            >
              Market data, farm operations intel, and financial context —
              so creamery teams understand the supply chain behind their milk.
            </p>

            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <SubscribeInlineForm />
              <Link href="/newsletters" className="link-green-hover inline-flex items-center gap-1.5 text-sm font-medium" style={{ color: "#4a5046" }}>
                Browse archive <ArrowRight size={14} />
              </Link>
            </div>
            <p className="mt-4 text-xs" style={{ color: "#8a9080" }}>Free. No spam. Unsubscribe anytime.</p>
          </div>
        </div>
      </section>

      {/* ─── MARKET DATA PREVIEW ─── */}
      <section style={{ paddingBottom: "96px" }}>
        <div className="max-w-7xl mx-auto px-6">
          <div className="rounded-2xl overflow-hidden" style={{ background: "#ffffff", border: "1px solid #d8d2be", boxShadow: "0 4px 24px rgba(0,0,0,0.06)" }}>
            <div className="px-6 py-4 flex items-center justify-between" style={{ borderBottom: "1px solid #ede8d8", background: "#f7f4ed" }}>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ background: "#1c4a2a" }} />
                <span className="text-sm font-semibold" style={{ color: "#2a2e26", fontFamily: "Georgia, serif" }}>Dairy Market Snapshot</span>
              </div>
              <span className="text-xs font-medium px-2.5 py-1 rounded-full" style={{ background: "#e8f5ec", color: "#1c4a2a" }}>Updated weekly</span>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
                {[
                  { label: "Class III", value: "$18.40", unit: "/cwt", trend: "+0.22", up: true },
                  { label: "Class IV",  value: "$18.10", unit: "/cwt", trend: "+0.18", up: true },
                  { label: "Butter",    value: "$2.841", unit: "/lb",  trend: "-0.012", up: false },
                  { label: "Cheddar",   value: "$1.963", unit: "/lb",  trend: "+0.005", up: true },
                  { label: "NFDM",      value: "$1.241", unit: "/lb",  trend: "+0.008", up: true },
                ].map(({ label, value, unit, trend, up }) => (
                  <div key={label} className="rounded-xl p-4" style={{ background: "#fdfcf9", border: "1px solid #ede8d8" }}>
                    <p className="mb-2" style={{ color: "#8a9080", letterSpacing: "0.04em", textTransform: "uppercase", fontSize: "10px" }}>{label}</p>
                    <p className="font-bold leading-none mb-1" style={{ color: "#111410", fontSize: "1.25rem", fontFamily: "Georgia, serif" }}>
                      {value}<span className="font-normal ml-0.5" style={{ color: "#8a9080", fontSize: "11px" }}>{unit}</span>
                    </p>
                    <p className="text-xs font-medium" style={{ color: up ? "#15803d" : "#dc2626" }}>{trend}</p>
                  </div>
                ))}
              </div>
              <div>
                <p className="mb-2" style={{ color: "#8a9080", letterSpacing: "0.05em", textTransform: "uppercase", fontSize: "10px", fontWeight: 500 }}>Class III Futures Strip</p>
                <div className="flex gap-2 flex-wrap">
                  {[
                    { m: "May '26", p: "$18.65" },
                    { m: "Jun '26", p: "$18.80" },
                    { m: "Jul '26", p: "$18.72" },
                    { m: "Aug '26", p: "$18.55" },
                    { m: "Sep '26", p: "$18.40" },
                    { m: "Oct '26", p: "$18.28" },
                  ].map(({ m, p }) => (
                    <div key={m} className="px-3 py-2 rounded-lg text-center" style={{ background: "#f7f4ed", border: "1px solid #ede8d8" }}>
                      <p className="text-xs" style={{ color: "#8a9080" }}>{m}</p>
                      <p className="text-sm font-semibold" style={{ color: "#1c4a2a" }}>{p}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="px-6 py-3" style={{ borderTop: "1px solid #ede8d8", background: "#f7f4ed" }}>
              <p className="text-xs" style={{ color: "#8a9080" }}>Sample data. Subscribers receive live market data every issue. Announced prices via USDA AMS · Futures via Barchart.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ─── WHAT YOU GET ─── */}
      <section style={{ padding: "96px 0", background: "#ffffff" }}>
        <div className="max-w-7xl mx-auto px-6">
          <div className="mb-16">
            <p className="text-sm font-medium mb-4" style={{ color: "#c8902a", letterSpacing: "0.06em", textTransform: "uppercase" }}>What&apos;s inside</p>
            <h2 className="font-bold tracking-tight" style={{ fontSize: "clamp(2rem, 4vw, 3rem)", color: "#111410", letterSpacing: "-0.025em", maxWidth: "480px", lineHeight: 1.15 }}>
              Everything your team needs to understand dairy.
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { number: "01", title: "Live market prices", desc: "Class III & IV announced prices, butter, cheese blocks, barrels, and NFDM — auto-pulled from USDA AMS each week." },
              { number: "02", title: "Farm operations intel", desc: "What's happening in the parlor, feedlot, and fields. Seasonal pressures, herd health cycles, and the decisions producers are making right now." },
              { number: "03", title: "Financial context", desc: "The economic forces behind your milk supply — input costs, margin compression, futures outlook, and what drives producer behavior." },
            ].map(({ number, title, desc }) => (
              <div key={number}>
                <p className="text-4xl font-bold mb-6 leading-none" style={{ color: "#ede8d8", fontFamily: "Georgia, serif", letterSpacing: "-0.03em" }}>{number}</p>
                <h3 className="font-semibold mb-3" style={{ fontSize: "1.125rem", color: "#111410", letterSpacing: "-0.01em" }}>{title}</h3>
                <p className="leading-relaxed text-sm" style={{ color: "#4a5046" }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── EDITORIAL SECTION ─── */}
      <section style={{ padding: "96px 0", background: "#fdfcf9" }}>
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <p className="text-sm font-medium mb-4" style={{ color: "#c8902a", letterSpacing: "0.06em", textTransform: "uppercase" }}>Why it matters</p>
              <h2 className="font-bold tracking-tight mb-6" style={{ fontSize: "clamp(2rem, 4vw, 2.75rem)", color: "#111410", letterSpacing: "-0.025em", lineHeight: 1.15 }}>
                Creameries and dairies are partners. Most don&apos;t speak the same language.
              </h2>
              <div className="space-y-5 text-sm leading-relaxed" style={{ color: "#4a5046" }}>
                <p>When Class III milk prices spike, dairy farmers feel it immediately. But creamery procurement teams often don&apos;t understand why their suppliers are frustrated, distracted, or asking for contract changes.</p>
                <p>When drought hits, feed costs rise. When feed costs rise, margins compress. When margins compress, herd decisions follow — and six months later, your milk supply changes.</p>
              </div>
              <div className="mt-8 p-5 rounded-xl" style={{ background: "#f7f4ed", borderLeft: "3px solid #c8902a" }}>
                <p className="font-semibold leading-snug" style={{ color: "#1c4a2a", fontSize: "1.0625rem", fontFamily: "Georgia, serif" }}>
                  &ldquo;DairyCFO gives your team the context to be a better supply chain partner.&rdquo;
                </p>
              </div>
            </div>
            <div className="space-y-4">
              {[
                { label: "Published weekly", desc: "Every issue includes fresh USDA market data automatically — no stale numbers." },
                { label: "Captive archive",   desc: "Subscribe once, access every issue ever published. Search, reference, share." },
                { label: "Sponsor-supported", desc: "Relevant industry sponsors. No paywalls. Free forever for creamery teams." },
              ].map(({ label, desc }) => (
                <div key={label} className="p-5 rounded-xl flex gap-4 items-start" style={{ background: "#ffffff", border: "1px solid #d8d2be" }}>
                  <div className="w-2 h-2 rounded-full mt-1.5 shrink-0" style={{ background: "#1c4a2a" }} />
                  <div>
                    <p className="font-semibold text-sm mb-1" style={{ color: "#111410" }}>{label}</p>
                    <p className="text-sm leading-relaxed" style={{ color: "#4a5046" }}>{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ─── RECENT ISSUES ─── */}
      {newsletters.length > 0 && (
        <section style={{ padding: "96px 0", background: "#ffffff" }}>
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex items-end justify-between mb-12">
              <div>
                <p className="text-sm font-medium mb-2" style={{ color: "#c8902a", letterSpacing: "0.06em", textTransform: "uppercase" }}>Archive</p>
                <h2 className="font-bold tracking-tight" style={{ fontSize: "clamp(2rem, 4vw, 2.75rem)", color: "#111410", letterSpacing: "-0.025em", lineHeight: 1.15 }}>Recent issues</h2>
              </div>
              <Link href="/newsletters" className="hidden md:inline-flex items-center gap-1.5 text-sm font-medium link-green-hover" style={{ color: "#4a5046" }}>
                All issues <ArrowRight size={14} />
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {newsletters.map((n) => (
                <Link key={n.id} href={`/newsletters/${n.slug}`} className="card-hover group block rounded-2xl p-6" style={{ background: "#fdfcf9", border: "1px solid #d8d2be" }}>
                  <div className="flex items-center gap-2 mb-4">
                    {n.issue_number && (
                      <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ background: "#e8f5ec", color: "#1c4a2a" }}>#{n.issue_number}</span>
                    )}
                    {n.published_at && (
                      <span className="text-xs" style={{ color: "#8a9080" }}>
                        {new Date(n.published_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                      </span>
                    )}
                  </div>
                  <h3 className="font-semibold mb-2 leading-snug" style={{ color: "#111410", fontSize: "1rem", letterSpacing: "-0.01em" }}>{n.title}</h3>
                  {n.excerpt && <p className="text-sm line-clamp-2 leading-relaxed" style={{ color: "#4a5046" }}>{n.excerpt}</p>}
                  <div className="flex items-center gap-1 mt-4 text-xs font-medium" style={{ color: "#1c4a2a" }}>
                    Read issue <ArrowRight size={11} />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ─── CTA ─── */}
      <section style={{ padding: "96px 0", background: "#1c4a2a" }}>
        <div className="max-w-7xl mx-auto px-6">
          <div className="max-w-2xl">
            <p className="text-sm font-medium mb-4" style={{ color: "#c8902a", letterSpacing: "0.06em", textTransform: "uppercase" }}>Free. Always.</p>
            <h2 className="font-bold tracking-tight mb-6" style={{ fontSize: "clamp(2rem, 4vw, 3rem)", color: "#ffffff", letterSpacing: "-0.025em", lineHeight: 1.15 }}>
              Join creamery teams who understand their milk supply.
            </h2>
            <p className="mb-10 leading-relaxed" style={{ color: "#a8c4b0", fontSize: "1.125rem" }}>
              Weekly market data and farm operations intelligence. Subscribe once, access everything.
            </p>
            <SubscribeInlineForm light />
          </div>
        </div>
      </section>

      {/* ─── SPONSOR STRIP ─── */}
      <section style={{ padding: "28px 0", borderTop: "1px solid #d8d2be" }}>
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm" style={{ color: "#4a5046" }}>Reach creamery procurement teams, QA directors, and operations leadership.</p>
          <Link href="/sponsors" className="btn-outline-green inline-flex items-center gap-2 h-9 px-5 rounded-full text-sm font-semibold">
            Sponsor an issue <ArrowRight size={13} />
          </Link>
        </div>
      </section>

      <SiteFooter />
    </div>
  )
}
