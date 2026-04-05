import { NextRequest, NextResponse } from "next/server"
import { createServiceClient } from "@/lib/supabase/server"
import * as XLSX from "xlsx"

// Supported Barchart Excel formats:
//
// 1. Simple 2-column:  A = Contract Month, B = Price
// 2. Full Barchart multi-column (Excel add-in):
//    Headers include "Contract Date" and "Close" columns
//    e.g. Quotes | Name | Last | Expiration Date | Contract Date | ... | Close | ...

interface FuturesRow {
  month: string
  price: number
}

interface ParseResult {
  futures: FuturesRow[]
  frontMonthPrice: number | null
}

// Convert Excel serial date number to YYYY-MM
function excelSerialToYearMonth(serial: number): string | null {
  // Excel epoch: Dec 30, 1899. Adjust for Lotus 1-2-3 leap year bug (serial > 59).
  const utcMs = (serial - 25569) * 86400 * 1000
  const d = new Date(utcMs)
  if (isNaN(d.getTime())) return null
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`
}

function normalizeMonth(cell: XLSX.CellObject): string | null {
  // Use the formatted display value first (xlsx sets cell.w when a format exists)
  const display = cell.w ? cell.w.trim() : ""
  const raw = String(cell.v ?? "").trim()

  // If cell value is a number, it's an Excel serial date
  if (cell.t === "n" || (cell.t !== "s" && !isNaN(Number(raw)))) {
    const serial = Number(raw)
    if (serial > 40000) return excelSerialToYearMonth(serial) // sanity: must be post-2009
  }

  // Use display string if it looks like a month ("Apr 2026", "April 2026", "2026-04")
  const src = display || raw
  if (!src) return null

  // Already YYYY-MM
  if (/^\d{4}-\d{2}$/.test(src)) return src

  // "Apr 2026" or "Apr 26"
  const match = src.match(/([A-Za-z]+)\s+(\d{2,4})/)
  if (match) {
    const year = match[2].length === 2 ? "20" + match[2] : match[2]
    const d = new Date(`${match[1]} 1, ${year}`)
    if (!isNaN(d.getTime())) {
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`
    }
  }

  // Fallback: try Date constructor on display string
  const d = new Date(src)
  if (!isNaN(d.getTime())) {
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`
  }

  return null
}

function parseBarchartSheet(ws: XLSX.WorkSheet): ParseResult {
  const range = XLSX.utils.decode_range(ws["!ref"] ?? "A1")

  // Read header row
  const headers: string[] = []
  for (let c = range.s.c; c <= range.e.c; c++) {
    const cell = ws[XLSX.utils.encode_cell({ r: range.s.r, c })]
    headers.push(cell ? String(cell.v ?? "").trim() : "")
  }

  // Detect Barchart multi-column format
  const contractDateCol = headers.findIndex((h) => h === "Contract Date")
  const closeCol = headers.findIndex((h) => h === "Close")

  const rows: FuturesRow[] = []

  if (contractDateCol !== -1 && closeCol !== -1) {
    // Full Barchart multi-column format
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
    // Simple 2-column format: A = month, B = price
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

  // Front month = earliest contract = current announced price
  const frontMonthPrice = rows.length > 0 ? rows[0].price : null

  return { futures: rows, frontMonthPrice }
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
  const type = (fd.get("type") as string) ?? "class_iii" // class_iii | class_iv | corn
  const explicitDate = fd.get("date") as string | null

  if (!file || file.size === 0) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 })
  }

  try {
    const buffer = Buffer.from(await file.arrayBuffer())
    const workbook = XLSX.read(buffer, { type: "buffer" })
    const sheetName = workbook.SheetNames[0]
    const ws = workbook.Sheets[sheetName]
    const { futures, frontMonthPrice } = parseBarchartSheet(ws)

    if (futures.length === 0) {
      return NextResponse.json({ error: "No valid price rows found in the file" }, { status: 400 })
    }

    const supabase = await createServiceClient()

    // Use explicit date if provided, otherwise merge onto the most recent existing row
    // so Barchart futures land on the same row as USDA spot prices
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

    // Upsert market_data row, merging futures column
    const fieldName =
      type === "class_iv"
        ? "class_iv_futures"
        : type === "corn"
        ? "corn_futures"
        : "class_iii_futures"

    // For Class III, also save the front-month close as the current announced price
    // and recalculate dairy margin if feed cost is available
    const upsertData: Record<string, unknown> = {
      data_date: dateStr,
      [fieldName]: futures,
      source: "barchart_excel",
    }

    if (type === "class_iii" && frontMonthPrice != null) {
      upsertData.class_iii_price = frontMonthPrice

      // Use most recent feed cost (USDA fetch date may differ from upload date)
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

    await supabase.from("market_data").upsert(upsertData, { onConflict: "data_date" })

    // After upsert: if Class III was just saved, patch the margin on any recent row
    // that has feed cost but no margin yet (handles case where USDA fetched first)
    if (type === "class_iii" && frontMonthPrice != null) {
      const { data: rows } = await supabase
        .from("market_data")
        .select("id, data_date, feed_cost_per_cwt, dairy_margin")
        .not("feed_cost_per_cwt", "is", null)
        .is("dairy_margin", null)
        .order("data_date", { ascending: false })
        .limit(5)

      for (const row of rows ?? []) {
        const margin = Math.round((frontMonthPrice - row.feed_cost_per_cwt) * 10000) / 10000
        await supabase.from("market_data").update({ dairy_margin: margin, class_iii_price: frontMonthPrice }).eq("id", row.id)
      }
    }

    return NextResponse.json({
      success: true,
      rows: futures.length,
      class_iii_price: type === "class_iii" ? frontMonthPrice : undefined,
      sample: futures.slice(0, 3),
    })
  } catch (err) {
    console.error("Excel parse error:", err)
    return NextResponse.json({ error: "Failed to parse Excel file" }, { status: 500 })
  }
}
