import { createServiceClient } from "@/lib/supabase/server"
import { MarketDataAdmin } from "@/components/admin/MarketDataAdmin"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

async function getRecentMarketData() {
  const supabase = await createServiceClient()
  const { data } = await supabase
    .from("market_data")
    .select("*")
    .order("data_date", { ascending: false })
    .limit(10)
  return data ?? []
}

export default async function MarketDataPage() {
  const recent = await getRecentMarketData()

  return (
    <div className="min-h-screen bg-[#f7f4ed]">
      <header className="bg-[#1c2e1f] text-[#f7f4ed] px-6 py-4 flex items-center gap-3">
        <Link href="/admin" className="text-[#a8b8a0] hover:text-[#f7f4ed] transition-colors">
          <ArrowLeft size={18} />
        </Link>
        <span className="font-serif font-bold">Market Data</span>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-10">
        <MarketDataAdmin recent={recent} />
      </main>
    </div>
  )
}
