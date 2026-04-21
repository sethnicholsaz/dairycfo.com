import { createServiceClient } from "@/lib/supabase/server"
import { MarketDataAdmin } from "@/components/admin/MarketDataAdmin"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

async function getRecentMarketData() {
  const supabase = await createServiceClient()
  const { data } = await supabase
    .from("market_data")
    .select("id, data_date, class_iii_price, class_iv_price, butter_price, cheese_blocks_price, nfdm_price, corn_price, alfalfa_price, soybean_meal_price, feed_cost_per_cwt, dairy_margin, class_iii_futures, source")
    .order("data_date", { ascending: false })
    .limit(10)
  return data ?? []
}

interface ContractClose {
  symbol: string
  close: number
  position: number
}

interface CommodityCloseRow {
  price_date: string
  commodity: string
  contracts: ContractClose[]
}

export interface FuturesDayRow {
  date: string
  fronts: Record<string, { symbol: string; close: number }>
}

async function getRecentFutures(): Promise<FuturesDayRow[]> {
  const supabase = await createServiceClient()
  const { data } = await supabase
    .from("commodity_closes")
    .select("price_date, commodity, contracts")
    .order("price_date", { ascending: false })
    .limit(90)

  const rows = (data ?? []) as CommodityCloseRow[]
  const byDate = new Map<string, Record<string, { symbol: string; close: number }>>()
  for (const row of rows) {
    const front = row.contracts?.[0]
    if (!front) continue
    if (!byDate.has(row.price_date)) byDate.set(row.price_date, {})
    byDate.get(row.price_date)![row.commodity] = { symbol: front.symbol, close: front.close }
  }

  return Array.from(byDate.entries())
    .map(([date, fronts]) => ({ date, fronts }))
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 10)
}

export default async function MarketDataPage() {
  const [recent, futures] = await Promise.all([getRecentMarketData(), getRecentFutures()])

  return (
    <div className="min-h-screen bg-cream-200">
      <header className="bg-green-900 text-cream-200 px-6 py-4 flex items-center gap-3">
        <Link href="/admin" className="text-[#a8b8a0] hover:text-cream-200 transition-colors">
          <ArrowLeft size={18} />
        </Link>
        <span className="font-serif font-bold">Market Data</span>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-10">
        <MarketDataAdmin recent={recent} futures={futures} />
      </main>
    </div>
  )
}
