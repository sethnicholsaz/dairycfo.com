import { createClient } from "@/lib/supabase/server"
import { TrendingUp, TrendingDown, Minus } from "lucide-react"

interface MarketRow {
  label: string
  value: number | null
  unit: string
  prev?: number | null
}

async function getLatestMarketData() {
  try {
    const supabase = await createClient()
    const { data } = await supabase
      .from("market_data")
      .select("*")
      .order("data_date", { ascending: false })
      .limit(2)
    return data ?? []
  } catch {
    return []
  }
}

function fmt(value: number | null, unit: string) {
  if (value === null) return "—"
  if (unit === "$/cwt") return `$${value.toFixed(2)}/cwt`
  if (unit === "$/lb") return `$${value.toFixed(4)}/lb`
  return `$${value.toFixed(2)}`
}

function Trend({ current, prev }: { current: number | null; prev?: number | null }) {
  if (!current || !prev) return <Minus size={14} className="text-[#8a8068]" />
  const diff = current - prev
  if (diff > 0.001) return <TrendingUp size={14} className="text-green-600" />
  if (diff < -0.001) return <TrendingDown size={14} className="text-red-500" />
  return <Minus size={14} className="text-[#8a8068]" />
}

export async function MarketSnapshot() {
  const [latest, prev] = await getLatestMarketData()

  if (!latest) {
    return (
      <div className="bg-[#f7f4ed] border border-[#d8d2be] rounded-lg p-6 my-6">
        <p className="text-sm text-[#8a8068] text-center">Market data coming soon.</p>
      </div>
    )
  }

  const rows: MarketRow[] = [
    { label: "Class III", value: latest.class_iii_price, unit: "$/cwt", prev: prev?.class_iii_price },
    { label: "Class IV", value: latest.class_iv_price, unit: "$/cwt", prev: prev?.class_iv_price },
    { label: "Butter", value: latest.butter_price, unit: "$/lb", prev: prev?.butter_price },
    { label: "Cheddar Blocks", value: latest.cheese_blocks_price, unit: "$/lb", prev: prev?.cheese_blocks_price },
    { label: "Cheddar Barrels", value: latest.cheese_barrels_price, unit: "$/lb", prev: prev?.cheese_barrels_price },
    { label: "NFDM", value: latest.nfdm_price, unit: "$/lb", prev: prev?.nfdm_price },
  ]

  const futures: { month: string; price: number }[] = latest.class_iii_futures ?? []

  return (
    <div className="bg-[#f7f4ed] border border-[#d8d2be] rounded-lg overflow-hidden my-6">
      {/* Header */}
      <div className="bg-[#1c4a2a] text-[#f7f4ed] px-5 py-3 flex items-center justify-between">
        <span className="font-serif font-semibold">Dairy Market Snapshot</span>
        <span className="text-xs text-[#8ab89a]">
          {latest.data_date
            ? new Date(latest.data_date + "T00:00:00").toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })
            : ""}
        </span>
      </div>

      {/* Announced prices */}
      <div className="p-5">
        <p className="text-xs text-[#8a8068] uppercase tracking-wider mb-3 font-medium">
          Announced Prices (USDA AMS)
        </p>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {rows.map((row) => (
            <div key={row.label} className="bg-white rounded p-3 border border-[#d8d2be]">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-[#6b6348]">{row.label}</span>
                <Trend current={row.value} prev={row.prev} />
              </div>
              <p className="font-serif font-bold text-[#1c4a2a] text-lg leading-none">
                {fmt(row.value, row.unit)}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Futures strip if available */}
      {futures.length > 0 && (
        <div className="px-5 pb-5 border-t border-[#d8d2be] pt-4">
          <p className="text-xs text-[#8a8068] uppercase tracking-wider mb-3 font-medium">
            Class III Futures Strip
          </p>
          <div className="flex gap-2 flex-wrap">
            {futures.slice(0, 6).map((f) => (
              <div
                key={f.month}
                className="bg-white border border-[#d8d2be] rounded px-3 py-2 text-center"
              >
                <p className="text-xs text-[#8a8068]">{f.month}</p>
                <p className="font-semibold text-[#1c4a2a] text-sm">${f.price.toFixed(2)}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="bg-[#f0ece0] px-5 py-2 text-xs text-[#8a8068] border-t border-[#d8d2be]">
        Announced prices via USDA AMS. Futures via Barchart. Not financial advice.
      </div>
    </div>
  )
}
