import { redirect } from "next/navigation"
import { SiteNav } from "@/components/layout/SiteNav"
import { SiteFooter } from "@/components/layout/SiteFooter"
import { getSubscriberFromCookie } from "@/lib/subscriber"
import { createServiceClient } from "@/lib/supabase/server"
import Link from "next/link"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Account — DairyCFO",
}

export default async function AccountPage() {
  const subscriber = await getSubscriberFromCookie()
  if (!subscriber) redirect("/subscribe")

  const supabase = await createServiceClient()
  const { data: profile } = await supabase
    .from("subscribers")
    .select("email, name, subscribed_at")
    .eq("id", subscriber.sub)
    .single()

  return (
    <div className="flex flex-col min-h-screen bg-cream-100">
      <SiteNav />

      <main className="flex-1 pt-[120px] pb-[96px]">
        <div className="max-w-2xl mx-auto px-6">

          <h1 className="font-bold mb-2 tracking-[-0.025em] text-[2rem] text-ink-900">
            Your account
          </h1>
          <p className="text-sm mb-10 text-ink-300">
            {profile?.email}
          </p>

          <div className="rounded-2xl p-6 bg-white border border-cream-400">
            <p className="text-xs font-semibold mb-4 uppercase tracking-[0.06em] text-ink-300">
              Account details
            </p>
            <dl className="space-y-3 text-sm">
              {profile?.name && (
                <div className="flex justify-between">
                  <dt className="text-ink-300">Name</dt>
                  <dd className="text-ink-900">{profile.name}</dd>
                </div>
              )}
              <div className="flex justify-between">
                <dt className="text-ink-300">Email</dt>
                <dd className="text-ink-900">{profile?.email}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-ink-300">Subscribed</dt>
                <dd className="text-ink-900">
                  {profile?.subscribed_at
                    ? new Date(profile.subscribed_at).toLocaleDateString("en-US", { month: "long", year: "numeric" })
                    : "—"}
                </dd>
              </div>
            </dl>

            <div className="mt-6 pt-4 border-t border-cream-300">
              <Link
                href="/unsubscribe"
                className="text-xs text-error"
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
