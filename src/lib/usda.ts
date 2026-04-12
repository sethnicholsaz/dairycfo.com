import * as Sentry from "@sentry/nextjs"

// USDA AMS Market News API
// Auth: HTTP Basic — API key as username, empty password
//
// Reports used:
//   1603 — CME Daily Cash Trading      (Butter, Cheese blocks/barrels, NFDM)
//   3618 — National Weekly Grain Co-Products (Corn, Soybean Meal Illinois)
//   2807 — Iowa Direct Hay Report      (Alfalfa $/ton)
//
// DMC Feed Cost formula (per cwt of milk):
//   60 lbs corn  +  27.4 lbs alfalfa  +  14.7 lbs soybean meal
//
// Class III and Class IV announced prices are FMMO-derived and NOT in this API.
// They are announced monthly by USDA and must be entered manually in the admin.

import { env } from "@/lib/env"

const USDA_BASE = "https://marsapi.ams.usda.gov/services/v1.2"
const USDA_API_KEY = env.USDA_AMS_API_KEY

function authHeader() {
  const encoded = Buffer.from(`${USDA_API_KEY}:`).toString("base64")
  return `Basic ${encoded}`
}

function parseDate(s: string): Date {
  const [m, d, y] = s.split("/").map(Number)
  return new Date(y, m - 1, d)
}

function latestDate(rows: { report_date: string }[]): string {
  return rows.reduce<string>((best, r) => {
    if (!best) return r.report_date
    return parseDate(r.report_date) > parseDate(best) ? r.report_date : best
  }, "")
}

function toIso(mmddyyyy: string): string {
  const [m, d, y] = mmddyyyy.split("/")
  return `${y}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`
}

// ─── CME spot prices (report 1603) ──────────────────────────────────────────

interface CmeRow {
  report_date: string
  commodity: string
  package?: string
  close_price?: number
}

export async function fetchDairyProductPrices(): Promise<{
  butter: number | null
  cheese_blocks: number | null
  cheese_barrels: number | null
  nfdm: number | null
  date: string
}> {
  if (!USDA_API_KEY) {
    return { butter: null, cheese_blocks: null, cheese_barrels: null, nfdm: null, date: new Date().toISOString().split("T")[0] }
  }

  try {
    const res = await fetch(`${USDA_BASE}/reports/1603?allSections=true&limit=50`, {
      headers: { Accept: "application/json", Authorization: authHeader() },
      next: { revalidate: 3600 },
    })
    if (!res.ok) throw new Error(`USDA 1603 error: ${res.status}`)

    const data = await res.json()
    const results: CmeRow[] = data[0]?.results ?? []
    if (!results.length) return { butter: null, cheese_blocks: null, cheese_barrels: null, nfdm: null, date: new Date().toISOString().split("T")[0] }

    const latest = latestDate(results)
    const rows = results.filter((r) => r.report_date === latest)
    const find = (commodity: string, pkg?: string) =>
      rows.find((r) => r.commodity === commodity && (!pkg || r.package === pkg))?.close_price ?? null

    return {
      butter: find("Butter"),
      cheese_blocks: find("Cheese", "40 pound Block"),
      cheese_barrels: find("Cheese", "Barrels"),
      nfdm: find("Nonfat Dry Milk"),
      date: toIso(latest),
    }
  } catch (err) {
    console.error("fetchDairyProductPrices error:", err)
    Sentry.captureException(err, {
      tags: { operation: "usda_fetch", report: "1603" },
    })
    return { butter: null, cheese_blocks: null, cheese_barrels: null, nfdm: null, date: new Date().toISOString().split("T")[0] }
  }
}

// ─── Feed cost inputs (reports 3618 + 2807) ─────────────────────────────────

export async function fetchFeedCostInputs(): Promise<{
  corn_price: number | null        // $/bushel
  alfalfa_price: number | null     // $/ton
  soybean_meal_price: number | null // $/ton
  feed_cost_per_cwt: number | null  // calculated $/cwt
}> {
  if (!USDA_API_KEY) {
    return { corn_price: null, alfalfa_price: null, soybean_meal_price: null, feed_cost_per_cwt: null }
  }

  const [grainRes, hayRes] = await Promise.allSettled([
    fetch(`${USDA_BASE}/reports/3618?allSections=true&limit=100`, {
      headers: { Accept: "application/json", Authorization: authHeader() },
      next: { revalidate: 3600 * 12 },
    }),
    fetch(`${USDA_BASE}/reports/2807?allSections=true&limit=60`, {
      headers: { Accept: "application/json", Authorization: authHeader() },
      next: { revalidate: 3600 * 12 },
    }),
  ])

  let corn_price: number | null = null
  let soybean_meal_price: number | null = null
  let alfalfa_price: number | null = null

  // Corn and soybean meal from report 3618
  if (grainRes.status === "rejected") {
    Sentry.captureException(grainRes.reason, {
      tags: { operation: "usda_fetch", report: "3618" },
    })
  } else if (!grainRes.value.ok) {
    Sentry.captureMessage(`USDA report 3618 returned ${grainRes.value.status}`, {
      level: "error",
      tags: { operation: "usda_fetch", report: "3618" },
    })
  }
  if (grainRes.status === "fulfilled" && grainRes.value.ok) {
    const data = await grainRes.value.json()

    for (const section of data) {
      const rows = section.results ?? []
      if (!rows.length) continue

      if (section.reportSection === "Report Input Cost") {
        const cornRows = rows.filter((r: any) => r.commodity === "Corn" && r.price != null)
        if (cornRows.length) {
          const latest = latestDate(cornRows)
          const row = cornRows.find((r: any) => r.report_date === latest)
          corn_price = row?.price ?? null
        }
      }

      if (section.reportSection === "Report Detail") {
        const sbmRows = rows.filter(
          (r: any) => r.commodity === "Soybean Meal" && r.trade_loc === "Illinois" && r.price != null
        )
        if (sbmRows.length) {
          const latest = latestDate(sbmRows)
          const row = sbmRows.find((r: any) => r.report_date === latest)
          soybean_meal_price = row?.price ?? null
        }
      }
    }
  }

  // Alfalfa from report 2807 (Iowa Direct Hay)
  if (hayRes.status === "rejected") {
    Sentry.captureException(hayRes.reason, {
      tags: { operation: "usda_fetch", report: "2807" },
    })
  } else if (!hayRes.value.ok) {
    Sentry.captureMessage(`USDA report 2807 returned ${hayRes.value.status}`, {
      level: "error",
      tags: { operation: "usda_fetch", report: "2807" },
    })
  }
  if (hayRes.status === "fulfilled" && hayRes.value.ok) {
    const data = await hayRes.value.json()

    for (const section of data) {
      if (section.reportSection !== "Report Details") continue
      const rows: any[] = section.results ?? []

      // Alfalfa per-ton trades with a real price
      const alfalfaRows = rows.filter(
        (r) =>
          r.class === "Alfalfa" &&
          r.price_Unit === "Per Ton" &&
          r.wtd_Avg_Price > 0
      )
      if (!alfalfaRows.length) continue

      const latest = latestDate(alfalfaRows.map((r) => ({ report_date: r.report_begin_date })))
      const latestRows = alfalfaRows.filter((r) => r.report_begin_date === latest)

      // Prefer Supreme > Premium > Good; fall back to average of all
      const qualityOrder = ["Supreme", "Premium", "Good", "Fair"]
      let picked: any = null
      for (const q of qualityOrder) {
        picked = latestRows.find((r) => r.quality === q && r.wtd_Avg_Price > 0)
        if (picked) break
      }
      if (!picked && latestRows.length) {
        const avg = latestRows.reduce((s, r) => s + r.wtd_Avg_Price, 0) / latestRows.length
        alfalfa_price = Math.round(avg * 100) / 100
      } else if (picked) {
        alfalfa_price = picked.wtd_Avg_Price
      }
    }
  }

  // DMC feed cost formula (per cwt of milk):
  //   60 lbs corn  ÷ 56 lbs/bushel
  //   27.4 lbs alfalfa  ÷ 2000 lbs/ton
  //   14.7 lbs soybean meal  ÷ 2000 lbs/ton
  let feed_cost_per_cwt: number | null = null
  if (corn_price != null && alfalfa_price != null && soybean_meal_price != null) {
    const corn_cost = (60 / 56) * corn_price
    const alfalfa_cost = (27.4 / 2000) * alfalfa_price
    const sbm_cost = (14.7 / 2000) * soybean_meal_price
    feed_cost_per_cwt = Math.round((corn_cost + alfalfa_cost + sbm_cost) * 10000) / 10000
  }

  return { corn_price, alfalfa_price, soybean_meal_price, feed_cost_per_cwt }
}

// Class III and IV are FMMO announced prices — not in the AMS API.
// Enter manually in the admin when USDA announces them (first Friday of each month).
export async function fetchClassPrices(): Promise<{
  class_iii: number | null
  class_iv: number | null
  date: string
}> {
  return { class_iii: null, class_iv: null, date: new Date().toISOString().split("T")[0] }
}
