import { createServiceClient } from "@/lib/supabase/server"
import Link from "next/link"
import { ArrowLeft, PlusCircle } from "lucide-react"

async function getNewsletters() {
  const supabase = await createServiceClient()
  const { data } = await supabase
    .from("newsletters")
    .select("id, title, slug, issue_number, published_at, sent_at, created_at")
    .order("created_at", { ascending: false })
  return data ?? []
}

export default async function AdminNewslettersPage() {
  const newsletters = await getNewsletters()

  return (
    <div className="min-h-screen bg-[#f7f4ed]">
      <header className="bg-[#1c2e1f] text-[#f7f4ed] px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/admin" className="text-[#a8b8a0] hover:text-[#f7f4ed] transition-colors">
            <ArrowLeft size={18} />
          </Link>
          <span className="font-serif font-bold">Newsletters</span>
        </div>
        <Link
          href="/admin/newsletters/new"
          className="inline-flex items-center gap-2 bg-[#c8902a] text-white px-3 py-1.5 rounded text-sm font-medium hover:bg-[#b07820] transition-colors"
        >
          <PlusCircle size={14} />
          New Issue
        </Link>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-10">
        <div className="bg-white rounded-lg border border-[#d8d2be] overflow-hidden">
          {newsletters.length === 0 ? (
            <div className="px-6 py-16 text-center text-sm text-[#8a8068]">
              No newsletters yet.{" "}
              <Link href="/admin/newsletters/new" className="text-[#1c4a2a] underline">
                Create your first issue →
              </Link>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs text-[#8a8068] uppercase tracking-wider border-b border-[#d8d2be]">
                  <th className="px-6 py-3 text-left">#</th>
                  <th className="px-6 py-3 text-left">Title</th>
                  <th className="px-6 py-3 text-left">Status</th>
                  <th className="px-6 py-3 text-left">Created</th>
                  <th className="px-6 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {newsletters.map((n) => (
                  <tr key={n.id} className="border-b border-[#f0ece0] last:border-0 hover:bg-[#fafaf7]">
                    <td className="px-6 py-4 text-[#c8902a] font-medium">
                      {n.issue_number ? `#${n.issue_number}` : "—"}
                    </td>
                    <td className="px-6 py-4 font-medium text-[#1c2e1f]">{n.title}</td>
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
                    <td className="px-6 py-4 text-[#8a8068] text-xs">
                      {new Date(n.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right flex items-center justify-end gap-3">
                      {n.slug && (
                        <a
                          href={`/newsletters/${n.slug}`}
                          target="_blank"
                          className="text-xs text-[#6b6348] hover:text-[#1c4a2a]"
                        >
                          View
                        </a>
                      )}
                      <Link
                        href={`/admin/newsletters/${n.id}`}
                        className="text-xs text-[#1c4a2a] hover:underline font-medium"
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
