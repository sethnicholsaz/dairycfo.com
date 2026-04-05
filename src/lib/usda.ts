// USDA AMS Market News API
// Docs: https://mymarketnews.ams.usda.gov/mymarketnews-api
// Auth: HTTP Basic auth — API key as username, empty password
//
// Report IDs used:
//   1603 — CME Group Daily Cash Trading (Butter, Cheese blocks/barrels, NFDM, Dry Whey)
//
// Note: Class III and Class IV announced prices are USDA FMMO-derived prices
// and are NOT available through this API. They are announced monthly and must
// be entered manually via the admin market data panel.

const USDA_BASE = "https://marsapi.ams.usda.gov/services/v1.2"
const USDA_API_KEY = process.env.USDA_AMS_API_KEY

function basicAuthHeader(): string {
  const encoded = Buffer.from(`${USDA_API_KEY}:`).toString("base64")
  return `Basic ${encoded}`
}

// Parses MM/DD/YYYY strings for comparison
function parseReportDate(s: string): Date {
  const [m, d, y] = s.split("/").map(Number)
  return new Date(y, m - 1, d)
}

interface CmeRow {
  report_date: string
  commodity: string
  package?: string
  close_price?: number
  "weekly Av"?: number
}

export async function fetchDairyProductPrices(): Promise<{
  butter: number | null
  cheese_blocks: number | null
  cheese_barrels: number | null
  nfdm: number | null
  date: string
}> {
  if (!USDA_API_KEY) {
    console.warn("USDA_AMS_API_KEY not set — skipping fetch")
    return { butter: null, cheese_blocks: null, cheese_barrels: null, nfdm: null, date: new Date().toISOString().split("T")[0] }
  }

  try {
    // 1603 returns data for multiple days — fetch enough rows to guarantee
    // we have all commodities for the most recent trading day
    const res = await fetch(
      `${USDA_BASE}/reports/1603?allSections=true&limit=50`,
      {
        headers: {
          Accept: "application/json",
          Authorization: basicAuthHeader(),
        },
        next: { revalidate: 3600 },
      }
    )

    if (!res.ok) throw new Error(`USDA API error: ${res.status}`)

    const data = await res.json()
    const results: CmeRow[] = data[0]?.results ?? []

    if (results.length === 0) {
      return { butter: null, cheese_blocks: null, cheese_barrels: null, nfdm: null, date: new Date().toISOString().split("T")[0] }
    }

    // Find the most recent report date
    const latestDate = results.reduce<string>((best, r) => {
      if (!best) return r.report_date
      return parseReportDate(r.report_date) > parseReportDate(best) ? r.report_date : best
    }, "")

    const latest = results.filter((r) => r.report_date === latestDate)

    const find = (commodity: string, pkg?: string) =>
      latest.find((r) => r.commodity === commodity && (!pkg || r.package === pkg))?.close_price ?? null

    // Convert MM/DD/YYYY to YYYY-MM-DD for storage
    const [m, d, y] = latestDate.split("/")
    const isoDate = `${y}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`

    return {
      butter: find("Butter"),
      cheese_blocks: find("Cheese", "40 pound Block"),
      cheese_barrels: find("Cheese", "Barrels"),
      nfdm: find("Nonfat Dry Milk"),
      date: isoDate,
    }
  } catch (err) {
    console.error("Failed to fetch USDA dairy prices:", err)
    return { butter: null, cheese_blocks: null, cheese_barrels: null, nfdm: null, date: new Date().toISOString().split("T")[0] }
  }
}

// Class III and IV are FMMO announced prices — not in the AMS Market News API.
// They are published monthly by USDA and must be entered manually in the admin.
export async function fetchClassPrices(): Promise<{
  class_iii: number | null
  class_iv: number | null
  date: string
}> {
  return { class_iii: null, class_iv: null, date: new Date().toISOString().split("T")[0] }
}
