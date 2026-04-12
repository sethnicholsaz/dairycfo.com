import Link from "next/link"
import { ArrowRight, Check } from "lucide-react"
import { SiteNav } from "@/components/layout/SiteNav"
import { SiteFooter } from "@/components/layout/SiteFooter"
import { UpgradeButton } from "@/components/pricing/UpgradeButton"
import { getCurrentSubscription } from "@/lib/subscription"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Pricing — DairyCFO",
  description: "Free weekly newsletter for dairy professionals. Pro and Team tiers with premium market data, early access, and exportable spreadsheets.",
}

export default async function PricingPage() {
  const currentSub = await getCurrentSubscription()

  const proMonthlyId = process.env.STRIPE_PRICE_PRO_MONTHLY
  const proAnnualId  = process.env.STRIPE_PRICE_PRO_ANNUAL
  const teamMonthlyId = process.env.STRIPE_PRICE_TEAM_MONTHLY
  const paidTiersLive = !!(proMonthlyId && proAnnualId && teamMonthlyId)

  const tiers = [
    {
      name: "Free",
      price: "$0",
      period: "forever",
      description: "The core DairyCFO newsletter, delivered every week.",
      features: [
        "Weekly dairy market newsletter",
        "Class III / IV price summaries",
        "Farm operations intel",
        "Full issue archive access",
        "Delivered to your inbox",
      ],
      isHighlighted: false,
    },
    {
      name: "Pro",
      price: "$19",
      period: "/month",
      annualNote: "or $180/year — save $48",
      description: "For professionals who need more depth and cleaner data.",
      features: [
        "Everything in Free",
        "Early access — read issues before send",
        "Premium deep-dive market reports",
        "Downloadable price history spreadsheets",
        "Ad-free reading experience",
        "Priority email support",
      ],
      isHighlighted: true,
      priceIdMonthly: proMonthlyId,
      priceIdAnnual: proAnnualId,
      planKey: "pro",
    },
    {
      name: "Team",
      price: "$49",
      period: "/month",
      description: "For co-ops, lenders, and firms with multiple dairy professionals.",
      features: [
        "Everything in Pro",
        "Up to 5 team seats",
        "Custom Class III / IV price alerts",
        "Exportable data (CSV / Excel)",
        "Shared team dashboard",
        "Dedicated account support",
      ],
      isHighlighted: false,
      priceIdMonthly: teamMonthlyId,
      planKey: "team",
    },
  ]

  return (
    <div className="flex flex-col min-h-screen" style={{ background: "#fdfcf9" }}>
      <SiteNav />

      <main className="flex-1">
        {/* Hero */}
        <section style={{ paddingTop: "120px", paddingBottom: "72px" }}>
          <div className="max-w-7xl mx-auto px-6 text-center">
            <p className="text-sm font-medium mb-5 inline-block" style={{ color: "#c8902a", letterSpacing: "0.06em", textTransform: "uppercase" }}>
              Pricing
            </p>
            <h1
              className="font-bold tracking-tight mb-5 mx-auto"
              style={{
                fontSize: "clamp(2.5rem, 5vw, 4rem)",
                color: "#111410",
                letterSpacing: "-0.03em",
                lineHeight: 1.1,
                maxWidth: "640px",
              }}
            >
              Simple pricing for dairy professionals.
            </h1>
            <p
              className="mx-auto leading-relaxed"
              style={{ color: "#4a5046", fontSize: "1.125rem", maxWidth: "480px" }}
            >
              Start free. Upgrade when you need deeper data, cleaner exports, or team access.
            </p>
          </div>
        </section>

        {/* Tier cards */}
        <section style={{ paddingBottom: "96px" }}>
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
              {tiers.map((tier) => {
                const { isHighlighted } = tier
                const isCurrentPlan = currentSub.plan === (tier.planKey ?? "free")

                return (
                  <div
                    key={tier.name}
                    className="rounded-2xl p-8 flex flex-col relative"
                    style={{
                      background: isHighlighted ? "#1c4a2a" : "#ffffff",
                      border: isHighlighted ? "none" : "1px solid #d8d2be",
                      boxShadow: isHighlighted
                        ? "0 8px 40px rgba(28,74,42,0.25)"
                        : "0 2px 8px rgba(0,0,0,0.04)",
                    }}
                  >
                    {/* Tier header */}
                    <div className="mb-6">
                      <p
                        className="text-xs font-semibold mb-3"
                        style={{
                          color: isHighlighted ? "#a8c4b0" : "#8a9080",
                          letterSpacing: "0.06em",
                          textTransform: "uppercase",
                        }}
                      >
                        {tier.name}
                      </p>
                      <div className="flex items-baseline gap-1 mb-1">
                        <span
                          className="font-bold tracking-tight"
                          style={{
                            fontSize: "2.5rem",
                            color: isHighlighted ? "#ffffff" : "#111410",
                            letterSpacing: "-0.03em",
                            fontFamily: "Georgia, serif",
                          }}
                        >
                          {tier.price}
                        </span>
                        <span
                          className="text-sm"
                          style={{ color: isHighlighted ? "#a8c4b0" : "#8a9080" }}
                        >
                          {tier.period}
                        </span>
                      </div>
                      {tier.annualNote && (
                        <p className="text-xs" style={{ color: isHighlighted ? "#a8c4b0" : "#8a9080" }}>
                          {tier.annualNote}
                        </p>
                      )}
                      <p
                        className="text-sm leading-relaxed mt-3"
                        style={{ color: isHighlighted ? "#c8deca" : "#4a5046" }}
                      >
                        {tier.description}
                      </p>
                    </div>

                    {/* Features */}
                    <ul className="space-y-3 mb-8 flex-1">
                      {tier.features.map((feature) => (
                        <li key={feature} className="flex items-start gap-3 text-sm">
                          <Check
                            size={14}
                            className="mt-0.5 shrink-0"
                            style={{ color: isHighlighted ? "#c8902a" : "#1c4a2a" }}
                          />
                          <span style={{ color: isHighlighted ? "#d4e8d8" : "#4a5046" }}>
                            {feature}
                          </span>
                        </li>
                      ))}
                    </ul>

                    {/* CTA */}
                    {isCurrentPlan ? (
                      <div
                        className="inline-flex items-center justify-center h-11 px-6 rounded-full text-sm font-semibold"
                        style={{
                          background: isHighlighted ? "rgba(255,255,255,0.15)" : "#f0ede6",
                          color: isHighlighted ? "#ffffff" : "#4a5046",
                        }}
                      >
                        Current plan
                      </div>
                    ) : tier.planKey && paidTiersLive && tier.priceIdMonthly ? (
                      <UpgradeButton
                        priceId={tier.priceIdMonthly}
                        label={`Get ${tier.name}`}
                        variant={isHighlighted ? "gold" : "outline-dark"}
                      />
                    ) : tier.planKey && !paidTiersLive ? (
                      <Link
                        href="/subscribe"
                        className="inline-flex items-center justify-center gap-2 h-11 px-6 rounded-full text-sm font-semibold"
                        style={isHighlighted
                          ? { background: "#c8902a", color: "#ffffff" }
                          : { background: "transparent", color: "#111410", border: "1.5px solid #d8d2be" }
                        }
                      >
                        Notify me at launch
                        <ArrowRight size={14} />
                      </Link>
                    ) : (
                      <Link
                        href="/subscribe"
                        className="inline-flex items-center justify-center gap-2 h-11 px-6 rounded-full text-sm font-semibold"
                        style={{ background: "transparent", color: "#1c4a2a", border: "1.5px solid #1c4a2a" }}
                      >
                        Subscribe free
                        <ArrowRight size={14} />
                      </Link>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        </section>

        {/* Sponsor CTA strip */}
        <section style={{ paddingBottom: "96px" }}>
          <div className="max-w-7xl mx-auto px-6">
            <div
              className="rounded-2xl px-8 py-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6"
              style={{ background: "#f0ede6", border: "1px solid #d8d2be" }}
            >
              <div>
                <p className="font-bold text-lg mb-1" style={{ color: "#111410", letterSpacing: "-0.02em" }}>
                  Looking to sponsor an issue?
                </p>
                <p className="text-sm" style={{ color: "#4a5046", maxWidth: "420px" }}>
                  Reach dairy industry decision-makers with a flat-fee placement. Starting at $500 per issue.
                </p>
              </div>
              <Link
                href="/sponsors"
                className="inline-flex items-center gap-2 h-11 px-6 rounded-full text-sm font-semibold shrink-0 transition-all duration-150"
                style={{ background: "#1c4a2a", color: "#ffffff" }}
              >
                See sponsorship options
                <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section style={{ paddingBottom: "96px" }}>
          <div className="max-w-3xl mx-auto px-6">
            <p className="text-xs font-semibold mb-10 text-center" style={{ color: "#8a9080", letterSpacing: "0.06em", textTransform: "uppercase" }}>
              Common questions
            </p>
            <div className="space-y-8">
              {[
                {
                  q: "Can I cancel anytime?",
                  a: "Yes. Cancel from your account page at any time. You keep Pro access through the end of your billing period.",
                },
                {
                  q: "Will the free tier stay free?",
                  a: "Yes. The weekly newsletter is and will remain free. Paid tiers add depth, not access barriers to the core product.",
                },
                {
                  q: "What's in the paid tiers exactly?",
                  a: "Pro adds early access to each issue before it sends, downloadable Class III/IV price history spreadsheets, premium deep-dive reports, and no ads. Team adds multiple seats, custom price alerts, and exportable data.",
                },
                {
                  q: "Can I sponsor an issue instead of subscribing?",
                  a: "Absolutely. Sponsorships are a separate product — a flat-fee placement in one or more issues. Visit the Sponsors page to learn more.",
                },
              ].map(({ q, a }) => (
                <div key={q}>
                  <p className="font-semibold text-sm mb-2" style={{ color: "#111410" }}>{q}</p>
                  <p className="text-sm leading-relaxed" style={{ color: "#4a5046" }}>{a}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  )
}
