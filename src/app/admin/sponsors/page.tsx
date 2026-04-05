import { createServiceClient } from "@/lib/supabase/server"
import { SponsorAdminActions } from "@/components/admin/SponsorAdminActions"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

async function getSponsors() {
  const supabase = await createServiceClient()
  const { data } = await supabase
    .from("sponsors")
    .select("*")
    .order("created_at", { ascending: false })
  return data ?? []
}

async function getNewsletters() {
  const supabase = await createServiceClient()
  const { data } = await supabase
    .from("newsletters")
    .select("id, title, issue_number, published_at")
    .is("sent_at", null)
    .order("created_at", { ascending: false })
  return data ?? []
}

const statusColor: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-700",
  paid: "bg-blue-100 text-blue-700",
  approved: "bg-green-100 text-green-700",
  rejected: "bg-red-100 text-red-700",
}

export default async function SponsorsPage() {
  const [sponsors, newsletters] = await Promise.all([getSponsors(), getNewsletters()])

  return (
    <div className="min-h-screen bg-[#f7f4ed]">
      <header className="bg-[#1c2e1f] text-[#f7f4ed] px-6 py-4 flex items-center gap-3">
        <Link href="/admin" className="text-[#a8b8a0] hover:text-[#f7f4ed] transition-colors">
          <ArrowLeft size={18} />
        </Link>
        <span className="font-serif font-bold">Sponsors</span>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-10">
        <div className="bg-white rounded-lg border border-[#d8d2be] overflow-hidden">
          <div className="px-6 py-4 border-b border-[#d8d2be]">
            <h2 className="font-semibold text-[#1c2e1f]">All Sponsor Requests ({sponsors.length})</h2>
          </div>

          {sponsors.length === 0 ? (
            <div className="px-6 py-12 text-center text-sm text-[#8a8068]">
              No sponsor requests yet.
            </div>
          ) : (
            <div className="divide-y divide-[#f0ece0]">
              {sponsors.map((s) => (
                <div key={s.id} className="px-6 py-5">
                  <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="font-semibold text-[#1c2e1f]">{s.company}</h3>
                        <span className={`text-xs px-2 py-0.5 rounded font-medium ${statusColor[s.status] ?? "bg-gray-100 text-gray-600"}`}>
                          {s.status}
                        </span>
                        {s.paid_amount_cents && (
                          <span className="text-xs text-green-600 font-medium">
                            ${(s.paid_amount_cents / 100).toFixed(0)} paid
                          </span>
                        )}
                      </div>
                      <div className="text-sm text-[#6b6348] space-y-0.5">
                        <p>{s.contact_name && `${s.contact_name} · `}{s.contact_email}</p>
                        {s.website && <p><a href={s.website} target="_blank" className="text-[#1c4a2a] hover:underline">{s.website}</a></p>}
                        {s.desired_newsletter && <p>Desired issue: <em>{s.desired_newsletter}</em></p>}
                        {s.message && <p className="text-xs text-[#8a8068] mt-1">&ldquo;{s.message}&rdquo;</p>}
                      </div>
                      {s.artwork_url && (
                        <div className="mt-2">
                          <a href={s.artwork_url} target="_blank" className="text-xs text-[#1c4a2a] underline">
                            View artwork ({s.artwork_filename})
                          </a>
                        </div>
                      )}
                    </div>
                    <div className="text-xs text-[#8a8068] text-right">
                      {new Date(s.created_at).toLocaleDateString()}
                    </div>
                  </div>

                  {/* Actions for paid sponsors */}
                  {s.status === "paid" && newsletters.length > 0 && (
                    <SponsorAdminActions sponsor={s} newsletters={newsletters} />
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
