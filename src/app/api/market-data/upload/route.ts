import { NextRequest, NextResponse } from "next/server"
import { createServiceClient } from "@/lib/supabase/server"
import * as XLSX from "xlsx"

// Supported Barchart Excel formats:
//
// Single file, multiple sheets. Sheet name determines data type:
//   "Class III"  (or contains "III")  → class_iii_futures + class_iii_price
//   "Class IV"   (or contains "IV")   → class_iv_futures
//   "Corn"       (or contains "Corn") → corn_futures
//
// Each sheet uses the Barchart Excel add-in format:
//   Headers include "Contract Date" and "Close" columns
//   e.g. Quotes | Name | Last | Expiration Date | Contract Date | ... | Close | ...
//
// Also supports simple 2-column fallback: A = Contract Month, B = Price

interface FuturesRow {
  month: string
  price: number
}

interface ParseResult {
  futures: FuturesRow[]
  frontMonthPrice: number | null
}

type MarketType = "class_iii" | "class_iv" | "corn"

// Detect market type from sheet name
function detectType(sheetName: string): MarketType {
  const n = sheetName.toLowerCase()
  if (n.includes("iv") || n.includes("4")) return "class_iv"
  if (n.includes("corn")) return "corn"
  return "class_iii" // default / "iii" / "3"
}

// Convert Excel serial date number to YYYY-MM
function excelSerialToYearMonth(serial: number): string | null {
  const utcMs = (serial - 25569) * 86400 * 1000
  const d = new Date(utcMs)
  if (isNaN(d.getTime())) return null
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`
}

function normalizeMonth(cell: XLSX.CellObject): string | null {
  const display = cell.w ? cell.w.trim() : ""
  const raw = String(cell.v ?? "").trim()

  // Numeric cell = Excel serial date
  if (cell.t === "n" || (cell.t !== "s" && !isNaN(Number(raw)))) {
    const serial = Number(raw)
    if (serial > 40000) return excelSerialToYearMonth(serial)
  }

  const src = display || raw
  if (!src) return null

  if (/^\d{4}-\d{2}$/.test(src)) return src

  const match = src.match(/([A-Za-z]+)\s+(\d{2,4})/)
  if (match) {
    const year = match[2].length === 2 ? "20" + match[2] : match[2]
    const d = new Date(`${match[1]} 1, ${year}`)
    if (!isNaN(d.getTime())) {
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`
    }
  }

  const d = new Date(src)
  if (!isNaN(d.getTime())) {
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`
  }

  return null
}

function parseBarchartSheet(ws: XLSX.WorkSheet): ParseResult {
  const range = XLSX.utils.decode_range(ws["!ref"] ?? "A1")

  const headers: string[] = []
  for (let c = range.s.c; c <= range.e.c; c++) {
    const cell = ws[XLSX.utils.encode_cell({ r: range.s.r, c })]
    headers.push(cell ? String(cell.v ?? "").trim() : "")
  }

  const contractDateCol = headers.findIndex((h) => h === "Contract Date")
  const closeCol = headers.findIndex((h) => h === "Close")

  const rows: FuturesRow[] = []

  if (contractDateCol !== -1 && closeCol !== -1) {
    for (let r = range.s.r + 1; r <= range.e.r; r++) {
      const monthCell = ws[XLSX.utils.encode_cell({ r, c: contractDateCol })]
      const closeCell = ws[XLSX.utils.encode_cell({ r, c: closeCol })]
      if (!monthCell || !closeCell) continue
      const month = normalizeMonth(monthCell)
      const price = parseFloat(String(closeCell.v ?? ""))
      if (!month || isNaN(price) || price <= 0) continue
      rows.push({ month, price })
    }
  } else {
    for (let r = range.s.r + 1; r <= range.e.r; r++) {
      const monthCell = ws[XLSX.utils.encode_cell({ r, c: 0 })]
      const priceCell = ws[XLSX.utils.encode_cell({ r, c: 1 })]
      if (!monthCell || !priceCell) continue
      const month = normalizeMonth(monthCell)
      const price = parseFloat(String(priceCell.v ?? ""))
      if (!month || isNaN(price) || price <= 0) continue
      rows.push({ month, price })
    }
  }

  rows.sort((a, b) => a.month.localeCompare(b.month))
  return { futures: rows, frontMonthPrice: rows.length > 0 ? rows[0].price : null }
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
  const explicitDate = fd.get("date") as string | null

  if (!file || file.size === 0) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 })
  }

  try {
    const buffer = Buffer.from(await file.arrayBuffer())
    const workbook = XLSX.read(buffer, { type: "buffer" })

    const supabase = await createServiceClient()

    // Resolve target date once for all sheets
    let dateStr = explicitDate
    if (!dateStr) {
      const { data: latest } = await supabase
        .from("market_data")
        .select("data_date")
        .order("data_date", { ascending: false })
        .limit(1)
        .single()
      dateStr = latest?.data_date ?? new Date().toISOString().split("T")[0]
    }

    const results: { sheet: string; type: MarketType; rows: number; frontMonthPrice: number | null }[] = []
    let class_iii_price: number | null = null

    for (const sheetName of workbook.SheetNames) {
      const ws = workbook.Sheets[sheetName]
      const { futures, frontMonthPrice } = parseBarchartSheet(ws)
      if (futures.length === 0) continue

      const type = detectType(sheetName)
      const fieldName =
        type === "class_iv" ? "class_iv_futures" :
        type === "corn"     ? "corn_futures" :
                              "class_iii_futures"

      const upsertData: Record<string, unknown> = {
        data_date: dateStr,
        [fieldName]: futures,
        source: "barchart_excel",
      }

      if (type === "class_iii" && frontMonthPrice != null) {
        class_iii_price = frontMonthPrice
        upsertData.class_iii_price = frontMonthPrice

        const { data: feedRow } = await supabase
          .from("market_data")
          .select("feed_cost_per_cwt")
          .not("feed_cost_per_cwt", "is", null)
          .order("data_date", { ascending: false })
          .limit(1)
          .single()

        const feedCost = feedRow?.feed_cost_per_cwt ?? null
        if (feedCost != null) {
          upsertData.dairy_margin = Math.round((frontMonthPrice - feedCost) * 10000) / 10000
        }
      }

      if (type === "class_iv" && frontMonthPrice != null) {
        upsertData.class_iv_price = frontMonthPrice
      }

      await supabase.from("market_data").upsert(upsertData, { onConflict: "data_date" })
      results.push({ sheet: sheetName, type, rows: futures.length, frontMonthPrice })
    }

    if (results.length === 0) {
      return NextResponse.json({ error: "No valid price rows found in any sheet" }, { status: 400 })
    }

    // Back-fill margin on rows that have feed cost but no margin
    if (class_iii_price != null) {
      const { data: unfilled } = await supabase
        .from("market_data")
        .select("id, feed_cost_per_cwt")
        .not("feed_cost_per_cwt", "is", null)
        .is("dairy_margin", null)
        .order("data_date", { ascending: false })
        .limit(5)

      for (const row of unfilled ?? []) {
        const margin = Math.round((class_iii_price - row.feed_cost_per_cwt) * 10000) / 10000
        await supabase.from("market_data").update({ dairy_margin: margin, class_iii_price }).eq("id", row.id)
      }
    }

    return NextResponse.json({
      success: true,
      sheets: results,
      class_iii_price,
    })
  } catch (err) {
    console.error("Excel parse error:", err)
    return NextResponse.json({ error: "Failed to parse Excel file" }, { status: 500 })
  }
}
