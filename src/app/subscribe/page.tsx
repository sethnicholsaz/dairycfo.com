import { SiteNav } from "@/components/layout/SiteNav"
import { SiteFooter } from "@/components/layout/SiteFooter"
import { SubscribeInlineForm } from "@/components/newsletter/SubscribeInlineForm"

export default function SubscribePage() {
  return (
    <div className="flex flex-col min-h-screen" style={{ background: "#fdfcf9" }}>
      <SiteNav />

      <main className="flex-1 flex items-center justify-center px-6" style={{ paddingTop: "96px", paddingBottom: "96px" }}>
        <div className="w-full max-w-lg">
          {/* Logo mark */}
          <div className="flex justify-center mb-10">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ background: "#1c4a2a" }}>
              <span style={{ color: "#c8902a", fontWeight: 800, fontSize: "22px", fontFamily: "Georgia, serif" }}>D</span>
            </div>
          </div>

          {/* Headline */}
          <div className="text-center mb-10">
            <h1
              className="font-bold tracking-tight mb-3"
              style={{ fontSize: "clamp(2rem, 4vw, 2.75rem)", color: "#111410", letterSpacing: "-0.025em" }}
            >
              Subscribe to DairyCFO
            </h1>
            <p className="leading-relaxed" style={{ color: "#4a5046", fontSize: "1.0625rem" }}>
              Free weekly market data and farm operations intelligence for dairy industry professionals.
            </p>
          </div>

          {/* Form card */}
          <div
            className="rounded-2xl p-8"
            style={{ background: "#ffffff", border: "1px solid #d8d2be", boxShadow: "0 4px 24px rgba(0,0,0,0.06)" }}
          >
            <div className="mb-6">
              <SubscribeInlineForm />
            </div>
            <p className="text-xs text-center" style={{ color: "#8a9080" }}>
              You get instant access to the full archive on signup. Unsubscribe anytime.
            </p>
          </div>

          {/* What you get */}
          <div className="mt-10 grid grid-cols-3 gap-4 text-center">
            {[
              { stat: "Weekly", label: "market data" },
              { stat: "Full",   label: "archive access" },
              { stat: "Free",   label: "always" },
            ].map(({ stat, label }) => (
              <div key={label}>
                <p className="font-bold text-lg" style={{ color: "#1c4a2a", letterSpacing: "-0.02em" }}>{stat}</p>
                <p className="text-xs mt-0.5" style={{ color: "#8a9080" }}>{label}</p>
              </div>
            ))}
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  )
}
