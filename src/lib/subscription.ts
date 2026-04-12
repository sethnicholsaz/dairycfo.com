import { createServiceClient } from "@/lib/supabase/server"
import { getSubscriberFromCookie } from "@/lib/subscriber"

export type Plan = "free" | "pro" | "team"

export interface SubscriptionInfo {
  plan: Plan
  status: string
  currentPeriodEnd: Date | null
  cancelAtPeriodEnd: boolean
  billingInterval: string | null
}

export const FREE_PLAN: SubscriptionInfo = {
  plan: "free",
  status: "active",
  currentPeriodEnd: null,
  cancelAtPeriodEnd: false,
  billingInterval: null,
}

/**
 * Get the subscription for the currently logged-in subscriber (from cookie).
 * Returns free plan if not subscribed or not logged in.
 */
export async function getCurrentSubscription(): Promise<SubscriptionInfo> {
  const subscriber = await getSubscriberFromCookie()
  if (!subscriber) return FREE_PLAN

  const supabase = await createServiceClient()
  const { data } = await supabase
    .from("subscriptions")
    .select("plan, status, current_period_end, cancel_at_period_end, billing_interval")
    .eq("subscriber_id", subscriber.sub)
    .in("status", ["active", "trialing"])
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle()

  if (!data) return FREE_PLAN

  return {
    plan: (data.plan as Plan) ?? "free",
    status: data.status,
    currentPeriodEnd: data.current_period_end ? new Date(data.current_period_end) : null,
    cancelAtPeriodEnd: data.cancel_at_period_end ?? false,
    billingInterval: data.billing_interval ?? null,
  }
}

export function isPro(info: SubscriptionInfo) {
  return (info.plan === "pro" || info.plan === "team") &&
    (info.status === "active" || info.status === "trialing")
}

export function isTeam(info: SubscriptionInfo) {
  return info.plan === "team" &&
    (info.status === "active" || info.status === "trialing")
}

// Stripe price IDs — set in .env
export const STRIPE_PRICES = {
  proMonthly:  process.env.STRIPE_PRICE_PRO_MONTHLY!,
  proAnnual:   process.env.STRIPE_PRICE_PRO_ANNUAL!,
  teamMonthly: process.env.STRIPE_PRICE_TEAM_MONTHLY!,
}
