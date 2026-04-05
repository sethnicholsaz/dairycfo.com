import { NewsletterEditor } from "@/components/admin/NewsletterEditor"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

export default function NewNewsletterPage() {
  return (
    <div className="min-h-screen bg-[#f7f4ed]">
      <header className="bg-[#1c2e1f] text-[#f7f4ed] px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/admin" className="text-[#a8b8a0] hover:text-[#f7f4ed] transition-colors">
            <ArrowLeft size={18} />
          </Link>
          <span className="font-serif font-bold">New Issue</span>
        </div>
        <nav className="flex items-center gap-4 text-sm text-[#a8b8a0]">
          <Link href="/admin" className="hover:text-[#f7f4ed]">Dashboard</Link>
        </nav>
      </header>
      <NewsletterEditor />
    </div>
  )
}
