import Link from "next/link"
import { SiteNav } from "@/components/layout/SiteNav"
import { SiteFooter } from "@/components/layout/SiteFooter"
import { SubscribeInlineForm } from "@/components/newsletter/SubscribeInlineForm"
import { ArrowRight } from "lucide-react"

export default async function HomePage() {

  return (
    <div className="flex flex-col min-h-screen" style={{ background: "#fdfcf9" }}>
      <SiteNav />

      {/* ─── HERO ─── */}
      <section style={{ paddingTop: "100px", paddingBottom: "80px" }}>
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

            {/* Left: copy */}
            <div>
              <div className="inline-flex items-center gap-2 mb-6 px-3 py-1.5 rounded-full" style={{ background: "#f0ede6", border: "1px solid #d8d2be" }}>
                <div className="w-1.5 h-1.5 rounded-full" style={{ background: "#c8902a" }} />
                <span className="text-sm font-medium" style={{ color: "#4a5046", letterSpacing: "0.04em", fontSize: "11px", textTransform: "uppercase" }}>
                  For dairy industry professionals
                </span>
              </div>

              <h1
                className="font-bold leading-[1.08] tracking-tight mb-6"
                style={{
                  fontSize: "clamp(2.75rem, 5vw, 4.5rem)",
                  color: "#111410",
                  letterSpacing: "-0.03em",
                }}
              >
                The heartbeat of<br />
                the dairy farm,<br />
                <span style={{ color: "#1c4a2a" }}>delivered weekly.</span>
              </h1>

              <p
                className="mb-8 leading-relaxed"
                style={{ fontSize: "clamp(1rem, 1.5vw, 1.2rem)", color: "#4a5046", maxWidth: "480px", letterSpacing: "-0.01em" }}
              >
                Market prices, farm operations intel, and financial context —
                so dairy industry professionals understand the farms they work with.
              </p>

              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <SubscribeInlineForm />
                <Link href="/newsletters" className="link-green-hover inline-flex items-center gap-1.5 text-sm font-medium" style={{ color: "#4a5046" }}>
                  Browse archive <ArrowRight size={14} />
                </Link>
              </div>
              <p className="mt-4 text-xs" style={{ color: "#8a9080" }}>Free. No spam. Unsubscribe anytime.</p>
            </div>

            {/* Right: sample newsletter preview */}
            <div className="hidden lg:block">
              <div className="rounded-2xl overflow-hidden" style={{ boxShadow: "0 8px 40px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.06)", transform: "rotate(1.5deg)", border: "1px solid #d8d2be" }}>
                {/* Masthead */}
                <div style={{ background: "#f7f4ed", padding: "16px 20px 12px", borderBottom: "3px solid #1c4a2a" }}>
                  <div className="flex items-center justify-between">
                    <span style={{ fontSize: "22px", fontFamily: "Georgia, serif", fontWeight: 800, color: "#1c4a2a", letterSpacing: "-0.02em" }}>DairyCFO</span>
                    <span style={{ fontSize: "10px", color: "#8a9080", letterSpacing: "0.08em", textTransform: "uppercase" }}>Issue #12 · April 2026</span>
                  </div>
                  <div style={{ fontSize: "9px", color: "#c8902a", letterSpacing: "0.14em", textTransform: "uppercase", marginTop: "4px" }}>What&apos;s Happening on the Farm</div>
                </div>
                {/* Headline */}
                <div style={{ background: "#ffffff", padding: "14px 20px 12px" }}>
                  <h3 style={{ fontSize: "17px", fontFamily: "Georgia, serif", fontWeight: 700, color: "#111410", lineHeight: 1.3, letterSpacing: "-0.015em", margin: 0 }}>
                    Spring Flush Is Here — What It Means for Your Milk Price
                  </h3>
                </div>
                {/* Market strip */}
                <div style={{ background: "#1c4a2a", padding: "12px 20px" }}>
                  <div style={{ fontSize: "9px", color: "#8ab89a", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "8px" }}>This Week&apos;s Prices</div>
                  <div className="grid grid-cols-4 gap-2">
                    {[
                      { label: "Class III", value: "$18.40", unit: "/cwt" },
                      { label: "Class IV",  value: "$18.10", unit: "/cwt" },
                      { label: "Butter",    value: "$2.841", unit: "/lb" },
                      { label: "Cheddar",   value: "$1.963", unit: "/lb" },
                    ].map(({ label, value, unit }) => (
                      <div key={label} style={{ textAlign: "center" }}>
                        <div style={{ fontSize: "14px", fontFamily: "Georgia, serif", fontWeight: 700, color: "#ffffff", lineHeight: 1 }}>{value}</div>
                        <div style={{ fontSize: "8px", color: "#8ab89a", textTransform: "uppercase", letterSpacing: "0.06em", marginTop: "3px" }}>{label}</div>
                        <div style={{ fontSize: "8px", color: "#4a7a5a", marginTop: "1px" }}>{unit}</div>
                      </div>
                    ))}
                  </div>
                </div>
                {/* Body excerpt */}
                <div style={{ background: "#ffffff", padding: "14px 20px" }}>
                  <p style={{ fontSize: "12px", lineHeight: 1.7, color: "#2d2a1e", fontFamily: "Georgia, serif", margin: "0 0 10px" }}>
                    Every spring, cows eat fresh pasture grass and their bodies respond the way you&apos;d expect — more milk, more butterfat, more everything. Dairymen call it spring flush.
                  </p>
                  <p style={{ fontSize: "12px", lineHeight: 1.7, color: "#2d2a1e", fontFamily: "Georgia, serif", margin: 0 }}>
                    For dairy industry professionals — creameries, co-ops, lenders, and equipment dealers — spring flush means lower spot prices and shifting cash flow assumptions across the supply chain...
                  </p>
                </div>
                {/* Footer */}
                <div style={{ background: "#1c2e1f", padding: "10px 20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: "10px", color: "#6a8870" }}>dairycfo.com</span>
                  <span style={{ fontSize: "10px", color: "#4a6050" }}>Unsubscribe</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

<SiteFooter />
    </div>
  )
}
