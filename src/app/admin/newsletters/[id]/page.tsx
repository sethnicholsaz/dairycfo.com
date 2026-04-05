import { notFound } from "next/navigation"
import { createServiceClient } from "@/lib/supabase/server"
import { NewsletterEditor } from "@/components/admin/NewsletterEditor"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

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

export default async function EditNewsletterPage({ params }: Props) {
  const { id } = await params
  const newsletter = await getNewsletter(id)

  if (!newsletter) notFound()

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
    </div>
  )
}
