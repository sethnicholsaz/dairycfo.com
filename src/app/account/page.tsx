import { redirect } from "next/navigation"
import { SiteNav } from "@/components/layout/SiteNav"
import { SiteFooter } from "@/components/layout/SiteFooter"
import { ManageBillingButton } from "@/components/account/ManageBillingButton"
import { UpgradeButton } from "@/components/pricing/UpgradeButton"
import { getCurrentSubscription, isPro } from "@/lib/subscription"
import { getSubscriberFromCookie } from "@/lib/subscriber"
import { createServiceClient } from "@/lib/supabase/server"
import { env } from "@/lib/env"
import { Check, ArrowRight } from "lucide-react"
import Link from "next/link"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Account — DairyCFO",
}

export default async function AccountPage({
  searchParams,
}: {
  searchParams: Promise<{ upgraded?: string }>
}) {
  const subscriber = await getSubscriberFromCookie()
  if (!subscriber) redirect("/subscribe")

  const sub = await getCurrentSubscription()
  const supabase = await createServiceClient()
  const { data: profile } = await supabase
    .from("subscribers")
    .select("email, name, subscribed_at")
    .eq("id", subscriber.sub)
    .single()

  const params = await searchParams
  const justUpgraded = params.upgraded === "1"

  const proMonthlyId = env.STRIPE_PRICE_PRO_MONTHLY
  const teamMonthlyId = env.STRIPE_PRICE_TEAM_MONTHLY
  const paidTiersLive = !!(proMonthlyId && teamMonthlyId)

  return (
    <div className="flex flex-col min-h-screen" style={{ background: "#fdfcf9" }}>
      <SiteNav />

      <main className="flex-1" style={{ paddingTop: "120px", paddingBottom: "96px" }}>
        <div className="max-w-2xl mx-auto px-6">

          {justUpgraded && (
            <div
              className="mb-8 rounded-xl px-6 py-4 flex items-center gap-3"
              style={{ background: "#edf5ee", border: "1px solid #a8d4b0" }}
            >
              <Check size={18} style={{ color: "#1c4a2a", flexShrink: 0 }} />
              <p className="text-sm font-medium" style={{ color: "#1c4a2a" }}>
                You&apos;re upgraded! Welcome to DairyCFO {sub.plan.charAt(0).toUpperCase() + sub.plan.slice(1)}.
              </p>
            </div>
          )}

          <h1 className="font-bold mb-2 tracking-tight" style={{ fontSize: "2rem", color: "#111410", letterSpacing: "-0.025em" }}>
            Your account
          </h1>
          <p className="text-sm mb-10" style={{ color: "#8a9080" }}>
            {profile?.email}
          </p>

          {/* Subscription status */}
          <div
            className="rounded-2xl p-6 mb-6"
            style={{ background: "#ffffff", border: "1px solid #d8d2be" }}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold mb-1" style={{ color: "#8a9080", letterSpacing: "0.06em", textTransform: "uppercase" }}>
                  Current plan
                </p>
                <p className="text-xl font-bold tracking-tight" style={{ color: "#111410" }}>
                  {sub.plan.charAt(0).toUpperCase() + sub.plan.slice(1)}
                  {sub.billingInterval && (
                    <span className="text-sm font-normal ml-2" style={{ color: "#8a9080" }}>
                      billed {sub.billingInterval}ly
                    </span>
                  )}
                </p>
                {sub.cancelAtPeriodEnd && sub.currentPeriodEnd && (
                  <p className="text-xs mt-1" style={{ color: "#c8902a" }}>
                    Cancels {sub.currentPeriodEnd.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
                  </p>
                )}
                {sub.currentPeriodEnd && !sub.cancelAtPeriodEnd && (
                  <p className="text-xs mt-1" style={{ color: "#8a9080" }}>
                    Renews {sub.currentPeriodEnd.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
                  </p>
                )}
              </div>
              {isPro(sub) ? (
                <ManageBillingButton />
              ) : null}
            </div>
          </div>

          {/* Upgrade prompt for free users */}
          {sub.plan === "free" && paidTiersLive && proMonthlyId && (
            <div
              className="rounded-2xl p-6 mb-6"
              style={{ background: "#1c4a2a", border: "none" }}
            >
              <p className="font-bold mb-1" style={{ color: "#ffffff", letterSpacing: "-0.01em" }}>
                Upgrade to Pro
              </p>
              <p className="text-sm mb-4" style={{ color: "#a8c4b0" }}>
                Early access, ad-free, downloadable price history. $19/month or $180/year.
              </p>
              <UpgradeButton priceId={proMonthlyId} label="Upgrade now" variant="gold" />
            </div>
          )}

          {sub.plan === "free" && !paidTiersLive && (
            <div
              className="rounded-2xl p-6 mb-6"
              style={{ background: "#f0ede6", border: "1px solid #d8d2be" }}
            >
              <p className="font-bold mb-1" style={{ color: "#111410" }}>
                Pro &amp; Team tiers coming soon
              </p>
              <p className="text-sm mb-4" style={{ color: "#4a5046" }}>
                Early access, premium data, and no ads. You&apos;ll be notified when they launch.
              </p>
              <Link
                href="/pricing"
                className="inline-flex items-center gap-1.5 text-sm font-medium"
                style={{ color: "#1c4a2a" }}
              >
                See what&apos;s included <ArrowRight size={13} />
              </Link>
            </div>
          )}

          {/* Account info */}
          <div
            className="rounded-2xl p-6"
            style={{ background: "#ffffff", border: "1px solid #d8d2be" }}
          >
            <p className="text-xs font-semibold mb-4" style={{ color: "#8a9080", letterSpacing: "0.06em", textTransform: "uppercase" }}>
              Account details
            </p>
            <dl className="space-y-3 text-sm">
              {profile?.name && (
                <div className="flex justify-between">
                  <dt style={{ color: "#8a9080" }}>Name</dt>
                  <dd style={{ color: "#111410" }}>{profile.name}</dd>
                </div>
              )}
              <div className="flex justify-between">
                <dt style={{ color: "#8a9080" }}>Email</dt>
                <dd style={{ color: "#111410" }}>{profile?.email}</dd>
              </div>
              <div className="flex justify-between">
                <dt style={{ color: "#8a9080" }}>Subscribed</dt>
                <dd style={{ color: "#111410" }}>
                  {profile?.subscribed_at
                    ? new Date(profile.subscribed_at).toLocaleDateString("en-US", { month: "long", year: "numeric" })
                    : "—"}
                </dd>
              </div>
            </dl>

            <div className="mt-6 pt-4" style={{ borderTop: "1px solid #e8e4d8" }}>
              <Link
                href="/unsubscribe"
                className="text-xs"
                style={{ color: "#c0392b" }}
              >
                Unsubscribe from newsletter
              </Link>
            </div>
          </div>

        </div>
      </main>

      <SiteFooter />
    </div>
  )
}
