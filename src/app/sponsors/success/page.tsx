import Link from "next/link"
import { SiteNav } from "@/components/layout/SiteNav"
import { SiteFooter } from "@/components/layout/SiteFooter"
import { CheckCircle } from "lucide-react"

export default function SponsorSuccessPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <SiteNav />
      <main className="flex-1 flex items-center justify-center bg-[#f7f4ed] py-20 px-4">
        <div className="max-w-md text-center">
          <CheckCircle size={48} className="text-[#1c4a2a] mx-auto mb-4" />
          <h1 className="font-serif text-3xl font-bold text-[#1c4a2a] mb-3">
            Payment Received
          </h1>
          <p className="text-[#6b6348] leading-relaxed mb-6">
            Thank you for sponsoring DairyCFO. We&apos;ll confirm your placement and
            reach out within 1 business day with next steps on artwork and issue
            scheduling.
          </p>
          <Link
            href="/"
            className="inline-block bg-[#1c4a2a] text-[#f7f4ed] px-6 py-3 rounded-lg text-sm font-semibold hover:bg-[#163d22] transition-colors"
          >
            Back to DairyCFO
          </Link>
        </div>
      </main>
      <SiteFooter />
    </div>
  )
}
