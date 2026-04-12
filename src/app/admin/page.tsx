import Link from "next/link"
import { createServiceClient } from "@/lib/supabase/server"
import { FileText, Users, Building2, BarChart3, PlusCircle } from "lucide-react"

async function getStats() {
  try {
    const supabase = await createServiceClient()
    const [newsletters, subscribers, sponsors, pending] = await Promise.all([
      supabase.from("newsletters").select("id", { count: "exact", head: true }),
      supabase.from("subscribers").select("id", { count: "exact", head: true }).is("unsubscribed_at", null),
      supabase.from("sponsors").select("id", { count: "exact", head: true }).eq("status", "paid"),
      supabase.from("sponsors").select("id", { count: "exact", head: true }).eq("status", "pending"),
    ])
    return {
      newsletters: newsletters.count ?? 0,
      subscribers: subscribers.count ?? 0,
      sponsors: sponsors.count ?? 0,
      pendingSponsors: pending.count ?? 0,
    }
  } catch {
    return { newsletters: 0, subscribers: 0, sponsors: 0, pendingSponsors: 0 }
  }
}

async function getRecentNewsletters() {
  try {
    const supabase = await createServiceClient()
    const { data } = await supabase
      .from("newsletters")
      .select("id, title, slug, issue_number, published_at, sent_at, created_at")
      .order("created_at", { ascending: false })
      .limit(5)
    return data ?? []
  } catch {
    return []
  }
}

export default async function AdminDashboard() {
  const [stats, recent] = await Promise.all([getStats(), getRecentNewsletters()])

  return (
    <div className="min-h-screen bg-cream-200">
      {/* Admin header */}
      <header className="bg-green-900 text-cream-200 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 bg-gold-600 rounded flex items-center justify-center">
            <span className="text-white font-bold text-xs font-serif">D</span>
          </div>
          <span className="font-serif font-bold">DairyCFO Admin</span>
        </div>
        <nav className="flex items-center gap-6 text-sm text-[#a8b8a0]">
          <Link href="/admin/newsletters" className="hover:text-cream-200 transition-colors">Newsletters</Link>
          <Link href="/admin/subscribers" className="hover:text-cream-200 transition-colors">Subscribers</Link>
          <Link href="/admin/sponsors" className="hover:text-cream-200 transition-colors">Sponsors</Link>
          <Link href="/admin/market-data" className="hover:text-cream-200 transition-colors">Market Data</Link>
          <Link href="/" className="text-gold-600 hover:text-gold-500 transition-colors">← Site</Link>
        </nav>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-10">
        <div className="flex items-center justify-between mb-8">
          <h1 className="font-serif text-2xl font-bold text-green-900">Dashboard</h1>
          <Link
            href="/admin/newsletters/new"
            className="inline-flex items-center gap-2 bg-green-800 text-cream-200 px-4 py-2 rounded-md text-sm font-semibold hover:bg-[#163d22] transition-colors"
          >
            <PlusCircle size={15} />
            New Issue
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          {[
            { icon: FileText, label: "Total Issues", value: stats.newsletters, href: "/admin/newsletters" },
            { icon: Users, label: "Subscribers", value: stats.subscribers, href: "/admin/subscribers" },
            { icon: Building2, label: "Paid Sponsors", value: stats.sponsors, href: "/admin/sponsors" },
            { icon: Building2, label: "Pending Sponsors", value: stats.pendingSponsors, href: "/admin/sponsors", alert: stats.pendingSponsors > 0 },
          ].map(({ icon: Icon, label, value, href, alert }) => (
            <Link
              key={label}
              href={href}
              className={`bg-white rounded-lg p-5 border transition-colors hover:border-green-800 ${
                alert ? "border-[#c8902a]" : "border-cream-400"
              }`}
            >
              <Icon size={16} className={alert ? "text-gold-600 mb-2" : "text-[#6b6348] mb-2"} />
              <p className="font-serif text-2xl font-bold text-green-900">{value}</p>
              <p className="text-xs text-[#6b6348] mt-0.5">{label}</p>
            </Link>
          ))}
        </div>

        {/* Recent newsletters */}
        <div className="bg-white rounded-lg border border-cream-400 overflow-hidden">
          <div className="px-6 py-4 border-b border-cream-400 flex items-center justify-between">
            <h2 className="font-semibold text-green-900 flex items-center gap-2">
              <FileText size={16} />
              Recent Issues
            </h2>
            <Link href="/admin/newsletters" className="text-xs text-gold-600 hover:underline">
              View all →
            </Link>
          </div>
          {recent.length === 0 ? (
            <div className="px-6 py-12 text-center text-[#8a8068] text-sm">
              No issues yet.{" "}
              <Link href="/admin/newsletters/new" className="text-green-800 underline">
                Create your first issue →
              </Link>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs text-[#8a8068] uppercase tracking-wider border-b border-cream-400">
                  <th className="px-6 py-3 text-left">#</th>
                  <th className="px-6 py-3 text-left">Title</th>
                  <th className="px-6 py-3 text-left">Status</th>
                  <th className="px-6 py-3 text-left">Published</th>
                  <th className="px-6 py-3 text-left">Sent</th>
                  <th className="px-6 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {recent.map((n) => (
                  <tr key={n.id} className="border-b border-[#f0ece0] last:border-0 hover:bg-[#fafaf7]">
                    <td className="px-6 py-4 text-gold-600 font-medium">
                      {n.issue_number ? `#${n.issue_number}` : "—"}
                    </td>
                    <td className="px-6 py-4 font-medium text-green-900">{n.title}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${
                          n.sent_at
                            ? "bg-green-100 text-green-700"
                            : n.published_at
                            ? "bg-blue-100 text-blue-700"
                            : "bg-[#f0ece0] text-[#8a8068]"
                        }`}
                      >
                        {n.sent_at ? "Sent" : n.published_at ? "Published" : "Draft"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-[#8a8068]">
                      {n.published_at
                        ? new Date(n.published_at).toLocaleDateString()
                        : "—"}
                    </td>
                    <td className="px-6 py-4 text-[#8a8068]">
                      {n.sent_at ? new Date(n.sent_at).toLocaleDateString() : "—"}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link
                        href={`/admin/newsletters/${n.id}`}
                        className="text-xs text-green-800 hover:underline"
                      >
                        Edit →
                      </Link>
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
