import { notFound } from "next/navigation"
import { createServiceClient } from "@/lib/supabase/server"
import { NewsletterEditor } from "@/components/admin/NewsletterEditor"
import Link from "next/link"
import { ArrowLeft, BarChart3 } from "lucide-react"

interface Props {
  params: Promise<{ id: string }>
}

async function getNewsletter(id: string) {
  const supabase = await createServiceClient()
  const { data } = await supabase
    .from("newsletters")
    .select("*")
    .eq("id", id)
    .single()
  return data
}

async function getAnalytics(newsletterId: string) {
  const supabase = await createServiceClient()
  const { data } = await supabase
    .from("newsletter_analytics")
    .select("event_type, email")
    .eq("newsletter_id", newsletterId)
  return data ?? []
}

async function getSubscriberCount() {
  const supabase = await createServiceClient()
  const { count } = await supabase
    .from("subscribers")
    .select("id", { count: "exact", head: true })
    .is("unsubscribed_at", null)
  return count ?? 0
}

export default async function EditNewsletterPage({ params }: Props) {
  const { id } = await params
  const [newsletter, analytics, subscriberCount] = await Promise.all([
    getNewsletter(id),
    getAnalytics(id),
    getSubscriberCount(),
  ])

  if (!newsletter) notFound()

  const uniqueOpens = analytics.filter((e) => e.event_type === "email.opened").length
  const uniqueClicks = analytics.filter((e) => e.event_type === "email.clicked").length
  const openRate = subscriberCount > 0 ? ((uniqueOpens / subscriberCount) * 100).toFixed(1) : null
  const clickRate = subscriberCount > 0 ? ((uniqueClicks / subscriberCount) * 100).toFixed(1) : null
  const showAnalytics = !!newsletter.sent_at && !!newsletter.broadcast_id

  return (
    <div className="min-h-screen bg-[#f7f4ed]">
      <header className="bg-[#1c2e1f] text-[#f7f4ed] px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/admin/newsletters" className="text-[#a8b8a0] hover:text-[#f7f4ed] transition-colors">
            <ArrowLeft size={18} />
          </Link>
          <span className="font-serif font-bold">
            {newsletter.title || "Edit Issue"}
          </span>
        </div>
        <div className="flex items-center gap-4 text-sm">
          {newsletter.published_at && (
            <span className="text-[#8ab89a] text-xs">
              {newsletter.sent_at ? "Sent" : "Published"}
            </span>
          )}
          {newsletter.slug && (
            <Link
              href={`/newsletters/${newsletter.slug}`}
              target="_blank"
              className="text-[#c8902a] text-xs hover:underline"
            >
              Preview →
            </Link>
          )}
        </div>
      </header>
      <NewsletterEditor newsletter={newsletter} />

      {showAnalytics && (
        <div className="max-w-7xl mx-auto px-6 pb-10">
          <div className="bg-white border border-[#d8d2be] rounded-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-[#d8d2be] flex items-center gap-2">
              <BarChart3 size={16} className="text-[#6b6348]" />
              <h2 className="font-semibold text-[#1c2e1f] text-sm">Email Analytics</h2>
              <span className="ml-auto text-xs text-[#8a8068]">Unique opens &amp; clicks per subscriber</span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-[#f0ece0]">
              <div className="px-6 py-5">
                <p className="text-2xl font-bold font-serif text-[#1c2e1f]">{uniqueOpens}</p>
                <p className="text-xs text-[#6b6348] mt-0.5">Unique Opens</p>
              </div>
              <div className="px-6 py-5">
                <p className="text-2xl font-bold font-serif text-[#1c2e1f]">
                  {openRate !== null ? `${openRate}%` : "—"}
                </p>
                <p className="text-xs text-[#6b6348] mt-0.5">Open Rate</p>
              </div>
              <div className="px-6 py-5">
                <p className="text-2xl font-bold font-serif text-[#1c2e1f]">{uniqueClicks}</p>
                <p className="text-xs text-[#6b6348] mt-0.5">Unique Clicks</p>
              </div>
              <div className="px-6 py-5">
                <p className="text-2xl font-bold font-serif text-[#1c2e1f]">
                  {clickRate !== null ? `${clickRate}%` : "—"}
                </p>
                <p className="text-xs text-[#6b6348] mt-0.5">Click Rate</p>
              </div>
            </div>
            {analytics.length === 0 && (
              <p className="px-6 py-4 text-xs text-[#8a8068] border-t border-[#f0ece0]">
                No engagement data yet. Make sure open/click tracking is enabled in your Resend dashboard settings.
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
