import { SiteNav } from "@/components/layout/SiteNav"
import { SiteFooter } from "@/components/layout/SiteFooter"
import { SponsorRequestForm } from "@/components/newsletter/SponsorRequestForm"
import { ArrowRight } from "lucide-react"

export default function SponsorsPage() {
  return (
    <div className="flex flex-col min-h-screen" style={{ background: "#fdfcf9" }}>
      <SiteNav />

      <main className="flex-1">
        {/* Hero */}
        <section style={{ paddingTop: "120px", paddingBottom: "80px" }}>
          <div className="max-w-7xl mx-auto px-6">
            <p className="text-sm font-medium mb-5" style={{ color: "#c8902a", letterSpacing: "0.06em", textTransform: "uppercase" }}>
              Sponsorships
            </p>
            <h1
              className="font-bold tracking-tight mb-5"
              style={{ fontSize: "clamp(2.5rem, 5vw, 4rem)", color: "#111410", letterSpacing: "-0.03em", lineHeight: 1.1, maxWidth: "640px" }}
            >
              Reach the people who buy milk.
            </h1>
            <p className="leading-relaxed" style={{ color: "#4a5046", fontSize: "1.125rem", maxWidth: "500px" }}>
              DairyCFO goes to creamery procurement teams, QA directors, plant managers, and co-op leadership — the people who make decisions about dairy supply relationships.
            </p>
          </div>
        </section>

        {/* Two-col content */}
        <section style={{ paddingBottom: "96px" }}>
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
              {/* Left: value prop */}
              <div>
                {/* Stats row */}
                <div className="grid grid-cols-3 gap-4 mb-12">
                  {[
                    { value: "1×", label: "flat fee per issue" },
                    { value: "100%", label: "relevant audience" },
                    { value: "∞", label: "archived permanently" },
                  ].map(({ value, label }) => (
                    <div key={label} className="rounded-xl p-4 text-center" style={{ background: "#ffffff", border: "1px solid #d8d2be" }}>
                      <p className="font-bold text-2xl mb-1" style={{ color: "#1c4a2a", letterSpacing: "-0.03em", fontFamily: "Georgia, serif" }}>{value}</p>
                      <p className="text-xs leading-snug" style={{ color: "#8a9080" }}>{label}</p>
                    </div>
                  ))}
                </div>

                <div className="space-y-6 mb-12">
                  {[
                    {
                      title: "Focused, not broad",
                      desc: "We don't write for consumers or farmers — we write for the creamery side of the supply chain. Your ad reaches people who speak your language.",
                    },
                    {
                      title: "Simple flat fee",
                      desc: "One price per issue. No CPM, no auctions, no complexity. Know exactly what you're getting before you pay.",
                    },
                    {
                      title: "Curated for relevance",
                      desc: "We review every sponsor for relevance to the dairy industry. Your brand appears alongside trusted editorial content.",
                    },
                    {
                      title: "Permanently archived",
                      desc: "Your placement stays in the issue forever. Subscribers who read back issues see your brand alongside the content.",
                    },
                  ].map(({ title, desc }) => (
                    <div key={title} className="flex gap-4">
                      <div className="w-1.5 h-1.5 rounded-full mt-2 shrink-0" style={{ background: "#c8902a" }} />
                      <div>
                        <p className="font-semibold text-sm mb-1" style={{ color: "#111410" }}>{title}</p>
                        <p className="text-sm leading-relaxed" style={{ color: "#4a5046" }}>{desc}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* What's included */}
                <div className="rounded-2xl p-6" style={{ background: "#1c4a2a" }}>
                  <p className="text-xs font-semibold mb-4" style={{ color: "#a8c4b0", letterSpacing: "0.06em", textTransform: "uppercase" }}>
                    Placement includes
                  </p>
                  <ul className="space-y-3">
                    {[
                      "Your logo or banner in the issue",
                      "Clickable link to your site",
                      '"Sponsored by" label',
                      "Permanent archive placement",
                      "Link in the email send",
                    ].map((item) => (
                      <li key={item} className="flex items-center gap-3 text-sm" style={{ color: "#d4e8d8" }}>
                        <ArrowRight size={12} className="shrink-0" style={{ color: "#c8902a" }} />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Right: form */}
              <div>
                <div
                  className="rounded-2xl p-8"
                  style={{ background: "#ffffff", border: "1px solid #d8d2be", boxShadow: "0 4px 24px rgba(0,0,0,0.06)" }}
                >
                  <h2
                    className="font-bold tracking-tight mb-2"
                    style={{ fontSize: "1.5rem", color: "#111410", letterSpacing: "-0.02em" }}
                  >
                    Request a placement
                  </h2>
                  <p className="text-sm mb-8" style={{ color: "#4a5046" }}>
                    Tell us about your company. You&apos;ll pay via credit card after we confirm availability and review your artwork.
                  </p>
                  <SponsorRequestForm />
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  )
}
