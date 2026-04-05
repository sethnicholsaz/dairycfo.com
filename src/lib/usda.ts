// USDA AMS Market News API
// Docs: https://mymarketnews.ams.usda.gov/mymarketnews-api
// Register for API key at: https://mymarketnews.ams.usda.gov/user/register

const USDA_BASE = "https://marsapi.ams.usda.gov/services/v1.2"
const USDA_API_KEY = process.env.USDA_AMS_API_KEY

// Report slugs we care about
// DY_WK100 = National Dairy Products Sales (butter, cheese, NFDM weekly)
// DY_MO101 = Federal Order Class Prices (Class III, IV announced)
const REPORT_IDS = {
  DAIRY_PRODUCTS_SALES: "2928", // National Dairy Products Sales
  CLASS_PRICES: "2971",         // Federal Order Class Prices
}

interface UsdaReport {
  report_date: string
  commodity: string
  price: number | null
  unit: string
  class?: string
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
    const res = await fetch(
      `${USDA_BASE}/reports/${REPORT_IDS.DAIRY_PRODUCTS_SALES}?allSections=true&limit=20`,
      {
        headers: {
          "Accept": "application/json",
          "X-Api-Key": USDA_API_KEY,
        },
        next: { revalidate: 3600 },
      }
    )

    if (!res.ok) throw new Error(`USDA API error: ${res.status}`)

    const data = await res.json()
    const results = data.results ?? []

    // Parse the most recent prices
    const latest = results[0] ?? {}

    return {
      butter: parseFloat(latest.butter_price ?? "0") || null,
      cheese_blocks: parseFloat(latest.cheese_40_price ?? "0") || null,
      cheese_barrels: parseFloat(latest.cheese_500_price ?? "0") || null,
      nfdm: parseFloat(latest.nfdm_price ?? "0") || null,
      date: latest.report_date ?? new Date().toISOString().split("T")[0],
    }
  } catch (err) {
    console.error("Failed to fetch USDA dairy prices:", err)
    return { butter: null, cheese_blocks: null, cheese_barrels: null, nfdm: null, date: new Date().toISOString().split("T")[0] }
  }
}

export async function fetchClassPrices(): Promise<{
  class_iii: number | null
  class_iv: number | null
  date: string
}> {
  if (!USDA_API_KEY) {
    return { class_iii: null, class_iv: null, date: new Date().toISOString().split("T")[0] }
  }

  try {
    const res = await fetch(
      `${USDA_BASE}/reports/${REPORT_IDS.CLASS_PRICES}?allSections=true&limit=10`,
      {
        headers: {
          "Accept": "application/json",
          "X-Api-Key": USDA_API_KEY,
        },
        next: { revalidate: 3600 * 24 },
      }
    )

    if (!res.ok) throw new Error(`USDA API error: ${res.status}`)

    const data = await res.json()
    const results = data.results ?? []

    const classIII = results.find((r: UsdaReport) => r.class === "Class III")
    const classIV = results.find((r: UsdaReport) => r.class === "Class IV")

    return {
      class_iii: classIII?.price ?? null,
      class_iv: classIV?.price ?? null,
      date: results[0]?.report_date ?? new Date().toISOString().split("T")[0],
    }
  } catch (err) {
    console.error("Failed to fetch USDA class prices:", err)
    return { class_iii: null, class_iv: null, date: new Date().toISOString().split("T")[0] }
  }
}
