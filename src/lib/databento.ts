import { env } from "@/lib/env"

// Databento Historical API — pulls daily settlement stats for CME futures and
// returns them shaped to fit the existing `commodity_closes` table.
//
// Auth: HTTP Basic, API key as username, empty password.
// Docs: https://databento.com/docs/schemas-and-data-formats/statistics

const DATABENTO_BASE = "https://hist.databento.com/v0"
const DATASET = "GLBX.MDP3"
const SCHEMA = "statistics"
const STAT_TYPE_SETTLEMENT = 3
const FIXED_PRICE_SCALE = 1e9
const UNDEF_PRICE = "9223372036854775807"

export interface ContractClose {
  symbol: string
  close: number
  position: number
}

export interface CommodityDayClose {
  commodity: string
  price_date: string
  contracts: ContractClose[]
}

// CME root → `commodity_closes.commodity` tag (matches values produced by the
// Barchart Excel upload route so downstream consumers stay uniform).
export const DATABENTO_ROOTS: { root: string; commodity: string }[] = [
  { root: "DC",  commodity: "class_iii" },
  { root: "GDK", commodity: "class_iv" },
  { root: "CB",  commodity: "butter" },
  { root: "CSC", commodity: "cheese" },
  { root: "GNF", commodity: "nfdm" },
  { root: "DY",  commodity: "dry_whey" },
  { root: "LE",  commodity: "live_cattle" },
  { root: "GF",  commodity: "feeder_cattle" },
  { root: "ZC",  commodity: "corn" },
]

const MONTH_CODE: Record<string, number> = {
  F: 1, G: 2, H: 3, J: 4, K: 5, M: 6,
  N: 7, Q: 8, U: 9, V: 10, X: 11, Z: 12,
}

function authHeader(): string {
  if (!env.DATABENTO_API_KEY) throw new Error("DATABENTO_API_KEY is not set")
  const encoded = Buffer.from(`${env.DATABENTO_API_KEY}:`).toString("base64")
  return `Basic ${encoded}`
}

// Build a sortable YYYYMM key from a raw CME contract symbol like "DCK6" or "LEM26".
// Single-digit years roll forward if they'd land in the past (e.g., "7" in 2029 → 2037).
function parseExpirySortKey(rawSymbol: string, root: string): number | null {
  const rest = rawSymbol.startsWith(root) ? rawSymbol.slice(root.length) : rawSymbol
  const m = rest.match(/^([FGHJKMNQUVXZ])(\d{1,2})$/)
  if (!m) return null
  const month = MONTH_CODE[m[1]]
  const digits = m[2]
  let year: number
  if (digits.length === 2) {
    year = 2000 + parseInt(digits, 10)
  } else {
    const now = new Date().getUTCFullYear()
    const decade = now - (now % 10)
    year = decade + parseInt(digits, 10)
    if (year < now - 1) year += 10
  }
  return year * 100 + month
}

function addDaysIso(iso: string, days: number): string {
  const d = new Date(`${iso}T00:00:00Z`)
  d.setUTCDate(d.getUTCDate() + days)
  return d.toISOString().slice(0, 10)
}

// Previous weekday in UTC. Used as the default settlement date.
export function previousTradingDayUtc(): string {
  const d = new Date()
  d.setUTCHours(0, 0, 0, 0)
  d.setUTCDate(d.getUTCDate() - 1)
  const day = d.getUTCDay()
  if (day === 0) d.setUTCDate(d.getUTCDate() - 2)
  else if (day === 6) d.setUTCDate(d.getUTCDate() - 1)
  return d.toISOString().slice(0, 10)
}

interface RawStatRecord {
  stat_type?: number
  price?: string
  symbol?: string
}

async function fetchRootSettlements(root: string, date: string): Promise<ContractClose[]> {
  const params = new URLSearchParams({
    dataset: DATASET,
    symbols: `${root}.FUT`,
    stype_in: "parent",
    schema: SCHEMA,
    start: date,
    end: addDaysIso(date, 1),
    encoding: "json",
    map_symbols: "true",
  })

  const res = await fetch(`${DATABENTO_BASE}/timeseries.get_range?${params.toString()}`, {
    headers: { Authorization: authHeader() },
  })

  if (!res.ok) {
    const body = await res.text().catch(() => "")
    throw new Error(`Databento ${root}.FUT ${res.status}: ${body.slice(0, 200)}`)
  }

  const text = await res.text()
  if (!text.trim()) return []

  const bySymbol = new Map<string, number>()

  for (const line of text.split("\n")) {
    const trimmed = line.trim()
    if (!trimmed) continue
    let rec: RawStatRecord
    try {
      rec = JSON.parse(trimmed) as RawStatRecord
    } catch {
      continue
    }
    if (rec.stat_type !== STAT_TYPE_SETTLEMENT) continue
    if (!rec.price || rec.price === UNDEF_PRICE) continue
    const symbol = rec.symbol
    if (!symbol) continue
    const price = Number(rec.price) / FIXED_PRICE_SCALE
    if (!Number.isFinite(price) || price <= 0) continue
    // Records arrive in event order — later records (e.g. final vs. preliminary) win.
    bySymbol.set(symbol, price)
  }

  return Array.from(bySymbol.entries())
    .map(([symbol, close]) => ({ symbol, close, sortKey: parseExpirySortKey(symbol, root) }))
    .filter((c): c is { symbol: string; close: number; sortKey: number } => c.sortKey !== null)
    .sort((a, b) => a.sortKey - b.sortKey)
    .map((c, i) => ({ symbol: c.symbol, close: c.close, position: i }))
}

export async function fetchAllCommodityCloses(date?: string): Promise<CommodityDayClose[]> {
  const targetDate = date ?? previousTradingDayUtc()

  const results = await Promise.all(
    DATABENTO_ROOTS.map(async ({ root, commodity }) => {
      const contracts = await fetchRootSettlements(root, targetDate)
      return contracts.length > 0
        ? { commodity, price_date: targetDate, contracts }
        : null
    })
  )

  return results.filter((r): r is CommodityDayClose => r !== null)
}
