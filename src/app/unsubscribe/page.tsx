import Link from "next/link"
import { SiteNav } from "@/components/layout/SiteNav"
import { SiteFooter } from "@/components/layout/SiteFooter"

export default function UnsubscribePage() {
  return (
    <div className="flex flex-col min-h-screen">
      <SiteNav />
      <main className="flex-1 flex items-center justify-center bg-cream-200 py-20 px-4">
        <div className="max-w-sm text-center">
          <h1 className="font-serif text-2xl font-bold text-green-800 mb-3">
            You&apos;ve been unsubscribed
          </h1>
          <p className="text-ink-500 text-sm mb-6">
            You won&apos;t receive any more DairyCFO emails. You can resubscribe at
            any time.
          </p>
          <Link
            href="/subscribe"
            className="text-sm text-green-800 underline underline-offset-2 hover:text-gold-600 transition-colors"
          >
            Resubscribe →
          </Link>
        </div>
      </main>
      <SiteFooter />
    </div>
  )
}
