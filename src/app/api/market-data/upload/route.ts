import { NextRequest, NextResponse } from "next/server"
import { createServiceClient } from "@/lib/supabase/server"
import * as XLSX from "xlsx"

// Expected Barchart Excel format:
// Column A: Contract Month (e.g. "May 2026" or "2026-05")
// Column B: Last Price (e.g. 18.50)
// Column C: (optional) Open, High, Low columns may be present — we skip them

interface FuturesRow {
  month: string
  price: number
}

function parseBarchartSheet(ws: XLSX.WorkSheet): FuturesRow[] {
  const rows: FuturesRow[] = []
  const range = XLSX.utils.decode_range(ws["!ref"] ?? "A1")

  for (let r = range.s.r + 1; r <= range.e.r; r++) {
    const monthCell = ws[XLSX.utils.encode_cell({ r, c: 0 })]
    const priceCell = ws[XLSX.utils.encode_cell({ r, c: 1 })]

    if (!monthCell || !priceCell) continue

    const rawMonth = String(monthCell.v ?? "").trim()
    const rawPrice = parseFloat(String(priceCell.v ?? ""))

    if (!rawMonth || isNaN(rawPrice) || rawPrice <= 0) continue

    // Normalize month to "YYYY-MM" format
    let month = rawMonth
    const dateAttempt = new Date(rawMonth)
    if (!isNaN(dateAttempt.getTime())) {
      month = `${dateAttempt.getFullYear()}-${String(dateAttempt.getMonth() + 1).padStart(2, "0")}`
    } else {
      // Try "May 26" / "May 2026" format
      const match = rawMonth.match(/([A-Za-z]+)\s+(\d{2,4})/)
      if (match) {
        const d = new Date(`${match[1]} 1, ${match[2].length === 2 ? "20" + match[2] : match[2]}`)
        if (!isNaN(d.getTime())) {
          month = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`
        }
      }
    }

    rows.push({ month, price: rawPrice })
  }

  return rows.sort((a, b) => a.month.localeCompare(b.month))
}

export async function POST(req: NextRequest) {
  // Admin-only
  const adminCookie = req.cookies.get("dcfo_admin")?.value
  if (adminCookie !== process.env.ADMIN_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const fd = await req.formData()
  const file = fd.get("file") as File | null
  const type = (fd.get("type") as string) ?? "class_iii" // class_iii | class_iv | corn
  const dateStr = (fd.get("date") as string) ?? new Date().toISOString().split("T")[0]

  if (!file || file.size === 0) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 })
  }

  try {
    const buffer = Buffer.from(await file.arrayBuffer())
    const workbook = XLSX.read(buffer, { type: "buffer" })
    const sheetName = workbook.SheetNames[0]
    const ws = workbook.Sheets[sheetName]
    const futures = parseBarchartSheet(ws)

    if (futures.length === 0) {
      return NextResponse.json({ error: "No valid price rows found in the file" }, { status: 400 })
    }

    const supabase = await createServiceClient()

    // Upsert market_data row for today, merging futures column
    const fieldName =
      type === "class_iv"
        ? "class_iv_futures"
        : type === "corn"
        ? "corn_futures"
        : "class_iii_futures"

    await supabase.from("market_data").upsert(
      {
        data_date: dateStr,
        [fieldName]: futures,
        source: "barchart_excel",
      },
      { onConflict: "data_date" }
    )

    return NextResponse.json({
      success: true,
      rows: futures.length,
      sample: futures.slice(0, 3),
    })
  } catch (err) {
    console.error("Excel parse error:", err)
    return NextResponse.json({ error: "Failed to parse Excel file" }, { status: 500 })
  }
}
