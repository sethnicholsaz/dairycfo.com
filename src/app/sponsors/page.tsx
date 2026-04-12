import { SiteNav } from "@/components/layout/SiteNav"
import { SiteFooter } from "@/components/layout/SiteFooter"
import { SponsorRequestForm } from "@/components/newsletter/SponsorRequestForm"
import { ArrowRight } from "lucide-react"

export default function SponsorsPage() {
  return (
    <div className="flex flex-col min-h-screen bg-cream-100">
      <SiteNav />

      <main className="flex-1">
        {/* Hero */}
        <section className="pt-[120px] pb-[80px]">
          <div className="max-w-7xl mx-auto px-6">
            <p className="text-sm font-medium mb-5 uppercase tracking-[0.06em] text-gold-600">
              Sponsorships
            </p>
            <h1
              className="font-bold tracking-[-0.03em] mb-5 text-ink-900"
              style={{ fontSize: "clamp(2.5rem, 5vw, 4rem)", lineHeight: 1.1, maxWidth: "640px" }}
            >
              Reach the people who buy milk.
            </h1>
            <p className="leading-relaxed text-ink-500 text-[1.125rem] max-w-[500px]">
              DairyCFO goes to dairy industry professionals — creamery procurement teams, co-op leadership, lenders, equipment dealers, hedger firms, and insurance agents — the people whose business is tied to what happens on dairy farms.
            </p>
          </div>
        </section>

        {/* Two-col content */}
        <section className="pb-[96px]">
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
                    <div key={label} className="rounded-xl p-4 text-center bg-white border border-cream-400">
                      <p className="font-bold text-2xl mb-1 font-serif text-green-800 tracking-[-0.03em]">{value}</p>
                      <p className="text-xs leading-snug text-ink-300">{label}</p>
                    </div>
                  ))}
                </div>

                <div className="space-y-6 mb-12">
                  {[
                    {
                      title: "Focused, not broad",
                      desc: "We don't write for consumers or farmers — we write for the professionals whose business depends on what happens on dairy farms: creameries, lenders, equipment dealers, hedger firms, and insurance agents. Your ad reaches people who speak your language.",
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
                      <div className="w-1.5 h-1.5 rounded-full mt-2 shrink-0 bg-gold-600" />
                      <div>
                        <p className="font-semibold text-sm mb-1 text-ink-900">{title}</p>
                        <p className="text-sm leading-relaxed text-ink-500">{desc}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* What's included */}
                <div className="rounded-2xl p-6 bg-green-800">
                  <p className="text-xs font-semibold mb-4 uppercase tracking-[0.06em]" style={{ color: "#a8c4b0" }}>
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
                        <ArrowRight size={12} className="shrink-0 text-gold-600" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Right: form */}
              <div>
                <div className="rounded-2xl p-8 bg-white border border-cream-400 shadow-card">
                  <h2
                    className="font-bold tracking-[-0.02em] mb-2 text-ink-900"
                    style={{ fontSize: "1.5rem" }}
                  >
                    Request a placement
                  </h2>
                  <p className="text-sm mb-8 text-ink-500">
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
