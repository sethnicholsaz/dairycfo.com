import { NextRequest, NextResponse } from "next/server"
import { createServiceClient } from "@/lib/supabase/server"
import * as XLSX from "xlsx"

// All sheets use the Barchart time-series format:
//
//   Row 0:  "Time Series"  | "LE*0" |      | "LE*1" |       | ...  (contract position labels)
//   Row 1:  "Date"         | "Symbol" | "Close" | "Symbol" | "Close" | ...
//   Row 2+: "4/2/2026"     | "LEM26"  | 246.325 | "LEJ26"  | 246.200 | ...
//
// Sheet name determines the commodity:
//   "Class III"     → class_iii
//   "Class IV"      → class_iv
//   "Corn"          → corn
//   "Live Cattle"   → live_cattle
//   "Feeder Cattle" → feeder_cattle
//   (any other name → snake_cased sheet name)

interface ContractClose {
  symbol: string
  close: number
  position: number
}

interface DayRow {
  date: string   // YYYY-MM-DD
  contracts: ContractClose[]
}

function detectCommodity(sheetName: string): string {
  const n = sheetName.toLowerCase().trim()
  if (n.includes("feeder")) return "feeder_cattle"
  if (n.includes("live") || (n.includes("cattle") && !n.includes("feeder"))) return "live_cattle"
  if (n.includes("class iv") || n.includes("class 4") || n === "iv") return "class_iv"
  if (n.includes("class iii") || n.includes("class 3") || n === "iii") return "class_iii"
  if (n.includes("corn")) return "corn"
  if (n.includes("soy") || n.includes("sbm")) return "soybean_meal"
  if (n.includes("wheat")) return "wheat"
  if (n.includes("butter")) return "butter"
  if (n.includes("cheese")) return "cheese"
  return n.replace(/\s+/g, "_").replace(/[^a-z0-9_]/g, "")
}

// Convert Excel serial date to YYYY-MM-DD
function excelSerialToDate(serial: number): string | null {
  const utcMs = (serial - 25569) * 86400 * 1000
  const d = new Date(utcMs)
  if (isNaN(d.getTime())) return null
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}-${String(d.getUTCDate()).padStart(2, "0")}`
}

function parseDate(cell: XLSX.CellObject): string | null {
  if (!cell) return null

  // Numeric = Excel serial date
  if (cell.t === "n" && typeof cell.v === "number" && cell.v > 40000) {
    return excelSerialToDate(cell.v)
  }

  // Use formatted display string first, then raw value
  const src = (cell.w ?? String(cell.v ?? "")).trim()
  if (!src) return null

  // M/D/YYYY or MM/DD/YYYY
  const slashMatch = src.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/)
  if (slashMatch) {
    const [, m, d, y] = slashMatch
    return `${y}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`
  }

  // Already YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(src)) return src

  const d = new Date(src)
  if (!isNaN(d.getTime())) {
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`
  }

  return null
}

function parseTimeSeriesSheet(ws: XLSX.WorkSheet): DayRow[] {
  const range = XLSX.utils.decode_range(ws["!ref"] ?? "A1")
  const rows: DayRow[] = []

  // Find the header row containing "Date" in column 0
  let headerRow = -1
  for (let r = range.s.r; r <= Math.min(range.s.r + 4, range.e.r); r++) {
    const cell = ws[XLSX.utils.encode_cell({ r, c: 0 })]
    if (cell && String(cell.v ?? "").trim().toLowerCase() === "date") {
      headerRow = r
      break
    }
  }
  if (headerRow === -1) return rows

  // Map column indices: find pairs of (Symbol, Close)
  // Headers look like: Date | Symbol | Close | Symbol | Close | ...
  const symbolCols: number[] = []
  const closeCols: number[] = []
  for (let c = range.s.c + 1; c <= range.e.c; c++) {
    const cell = ws[XLSX.utils.encode_cell({ r: headerRow, c })]
    const val = String(cell?.v ?? "").trim().toLowerCase()
    if (val === "symbol") symbolCols.push(c)
    else if (val === "close") closeCols.push(c)
  }

  if (closeCols.length === 0) return rows

  // Parse data rows
  for (let r = headerRow + 1; r <= range.e.r; r++) {
    const dateCell = ws[XLSX.utils.encode_cell({ r, c: 0 })]
    if (!dateCell) continue

    const date = parseDate(dateCell)
    if (!date) continue

    const contracts: ContractClose[] = []
    for (let i = 0; i < closeCols.length; i++) {
      const closeCell = ws[XLSX.utils.encode_cell({ r, c: closeCols[i] })]
      const close = parseFloat(String(closeCell?.v ?? ""))
      if (isNaN(close) || close <= 0) continue

      // Try to get symbol from the corresponding symbol column
      let symbol = ""
      if (symbolCols[i] !== undefined) {
        const symCell = ws[XLSX.utils.encode_cell({ r, c: symbolCols[i] })]
        symbol = String(symCell?.v ?? "").trim()
      }

      contracts.push({ symbol, close, position: i })
    }

    if (contracts.length > 0) {
      rows.push({ date, contracts })
    }
  }

  return rows
}

export async function POST(req: NextRequest) {
  const adminCookie = req.cookies.get("dcfo_admin")?.value
  const cronSecret = req.headers.get("x-cron-secret")
  const authorized =
    adminCookie === process.env.ADMIN_SECRET ||
    (cronSecret && cronSecret === process.env.CRON_SECRET)
  if (!authorized) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const fd = await req.formData()
  const file = fd.get("file") as File | null

  if (!file || file.size === 0) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 })
  }

  try {
    const buffer = Buffer.from(await file.arrayBuffer())
    const workbook = XLSX.read(buffer, { type: "buffer" })
    const supabase = await createServiceClient()

    const results: { sheet: string; commodity: string; dates: number; latestDate: string | null; frontMonthPrice: number | null }[] = []

    for (const sheetName of workbook.SheetNames) {
      const ws = workbook.Sheets[sheetName]
      const dayRows = parseTimeSeriesSheet(ws)
      if (dayRows.length === 0) continue

      const commodity = detectCommodity(sheetName)

      // Upsert each date row into commodity_closes
      const upsertRows = dayRows.map((row) => ({
        price_date: row.date,
        commodity,
        contracts: row.contracts,
      }))

      await supabase
        .from("commodity_closes")
        .upsert(upsertRows, { onConflict: "price_date,commodity" })

      // Most recent date = latest in the uploaded data
      const sorted = [...dayRows].sort((a, b) => b.date.localeCompare(a.date))
      const latest = sorted[0]
      const frontMonthPrice = latest?.contracts[0]?.close ?? null
      const latestDate = latest?.date ?? null

      // Sync front-month price into market_data for dairy commodities
      if (frontMonthPrice != null && latestDate != null) {
        const marketField =
          commodity === "class_iii" ? "class_iii_price" :
          commodity === "class_iv"  ? "class_iv_price" :
          commodity === "corn"      ? "corn_price" :
          null

        if (marketField) {
          // Upsert onto the most recent market_data row
          const { data: latestMarket } = await supabase
            .from("market_data")
            .select("data_date, feed_cost_per_cwt")
            .order("data_date", { ascending: false })
            .limit(1)
            .single()

          const targetDate = latestMarket?.data_date ?? latestDate
          const upsertData: Record<string, unknown> = {
            data_date: targetDate,
            [marketField]: frontMonthPrice,
            source: "barchart_excel",
          }

          // Recalculate dairy margin if we just updated Class III
          if (commodity === "class_iii") {
            const feedCost = latestMarket?.feed_cost_per_cwt ?? null
            if (feedCost != null) {
              upsertData.dairy_margin = Math.round((frontMonthPrice - feedCost) * 10000) / 10000
            }
          }

          await supabase.from("market_data").upsert(upsertData, { onConflict: "data_date" })

          // Back-fill margin on rows missing it
          if (commodity === "class_iii") {
            const { data: unfilled } = await supabase
              .from("market_data")
              .select("id, feed_cost_per_cwt")
              .not("feed_cost_per_cwt", "is", null)
              .is("dairy_margin", null)
              .order("data_date", { ascending: false })
              .limit(5)

            for (const row of unfilled ?? []) {
              await supabase.from("market_data").update({
                dairy_margin: Math.round((frontMonthPrice - row.feed_cost_per_cwt) * 10000) / 10000,
                class_iii_price: frontMonthPrice,
              }).eq("id", row.id)
            }
          }
        }
      }

      results.push({ sheet: sheetName, commodity, dates: dayRows.length, latestDate, frontMonthPrice })
    }

    if (results.length === 0) {
      return NextResponse.json({ error: "No valid data found in any sheet" }, { status: 400 })
    }

    return NextResponse.json({ success: true, sheets: results })
  } catch (err) {
    console.error("Excel parse error:", err)
    return NextResponse.json({ error: "Failed to parse Excel file" }, { status: 500 })
  }
}
