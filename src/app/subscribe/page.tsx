import { SiteNav } from "@/components/layout/SiteNav"
import { SiteFooter } from "@/components/layout/SiteFooter"
import { SubscribeInlineForm } from "@/components/newsletter/SubscribeInlineForm"

export default function SubscribePage() {
  return (
    <div className="flex flex-col min-h-screen bg-cream-100">
      <SiteNav />

      <main className="flex-1 flex items-center justify-center px-6 pt-[96px] pb-[96px]">
        <div className="w-full max-w-lg">
          {/* Logo mark */}
          <div className="flex justify-center mb-10">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center bg-green-800">
              <span className="text-gold-600 font-extrabold text-[22px] font-serif">D</span>
            </div>
          </div>

          {/* Headline */}
          <div className="text-center mb-10">
            <h1
              className="font-bold tracking-[-0.025em] mb-3 text-ink-900"
              style={{ fontSize: "clamp(2rem, 4vw, 2.75rem)" }}
            >
              Subscribe to DairyCFO
            </h1>
            <p className="leading-relaxed text-ink-500 text-[1.0625rem]">
              Free weekly market data and farm operations intelligence for dairy industry professionals.
            </p>
          </div>

          {/* Form card */}
          <div className="rounded-2xl p-8 bg-white border border-cream-400 shadow-card">
            <div className="mb-6">
              <SubscribeInlineForm />
            </div>
            <p className="text-xs text-center text-ink-300">
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
                <p className="font-bold text-lg text-green-800 tracking-[-0.02em]">{stat}</p>
                <p className="text-xs mt-0.5 text-ink-300">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  )
}
