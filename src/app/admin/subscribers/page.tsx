import { createServiceClient } from "@/lib/supabase/server"
import Link from "next/link"
import { ArrowLeft, Users } from "lucide-react"

async function getSubscribers() {
  const supabase = await createServiceClient()
  const { data } = await supabase
    .from("subscribers")
    .select("id, email, name, subscribed_at, unsubscribed_at")
    .order("subscribed_at", { ascending: false })
  return data ?? []
}

export default async function SubscribersPage() {
  const subscribers = await getSubscribers()
  const active = subscribers.filter((s) => !s.unsubscribed_at)
  const inactive = subscribers.filter((s) => s.unsubscribed_at)

  return (
    <div className="min-h-screen bg-[#f7f4ed]">
      <header className="bg-[#1c2e1f] text-[#f7f4ed] px-6 py-4 flex items-center gap-3">
        <Link href="/admin" className="text-[#a8b8a0] hover:text-[#f7f4ed] transition-colors">
          <ArrowLeft size={18} />
        </Link>
        <span className="font-serif font-bold">Subscribers</span>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-10">
        <div className="flex items-center gap-4 mb-8">
          <div className="flex items-center gap-2 bg-white border border-[#d8d2be] rounded-lg px-4 py-3">
            <Users size={16} className="text-[#1c4a2a]" />
            <div>
              <p className="font-serif text-2xl font-bold text-[#1c2e1f]">{active.length}</p>
              <p className="text-xs text-[#6b6348]">Active subscribers</p>
            </div>
          </div>
          <div className="flex items-center gap-2 bg-white border border-[#d8d2be] rounded-lg px-4 py-3">
            <div>
              <p className="font-serif text-2xl font-bold text-[#1c2e1f]">{inactive.length}</p>
              <p className="text-xs text-[#6b6348]">Unsubscribed</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-[#d8d2be] overflow-hidden">
          <div className="px-6 py-4 border-b border-[#d8d2be]">
            <h2 className="font-semibold text-[#1c2e1f]">Active Subscribers ({active.length})</h2>
          </div>
          {active.length === 0 ? (
            <div className="px-6 py-12 text-center text-sm text-[#8a8068]">
              No subscribers yet.
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs text-[#8a8068] uppercase tracking-wider border-b border-[#d8d2be]">
                  <th className="px-6 py-3 text-left">Email</th>
                  <th className="px-6 py-3 text-left">Name</th>
                  <th className="px-6 py-3 text-left">Subscribed</th>
                </tr>
              </thead>
              <tbody>
                {active.map((s) => (
                  <tr key={s.id} className="border-b border-[#f0ece0] last:border-0">
                    <td className="px-6 py-3 font-mono text-sm">{s.email}</td>
                    <td className="px-6 py-3 text-[#6b6348]">{s.name ?? "—"}</td>
                    <td className="px-6 py-3 text-[#8a8068] text-xs">
                      {new Date(s.subscribed_at).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </main>
    </div>
  )
}
