import { NextRequest, NextResponse } from "next/server"
import { createServiceClient } from "@/lib/supabase/server"
import { fetchAllCommodityCloses } from "@/lib/databento"
import { env } from "@/lib/env"

async function runFetch(date?: string) {
  const closes = await fetchAllCommodityCloses(date)
  if (closes.length === 0) {
    return { success: true, rows: 0, commodities: [], note: "No settlements returned for that date" }
  }

  const supabase = await createServiceClient()

  const upsertRows = closes.map((c) => ({
    price_date: c.price_date,
    commodity: c.commodity,
    contracts: c.contracts,
  }))

  const { error } = await supabase
    .from("commodity_closes")
    .upsert(upsertRows, { onConflict: "price_date,commodity" })
  if (error) throw error

  // Mirror the upload route: sync front-month price into `market_data` for the
  // commodities that feed the dairy margin calc.
  const frontMonthByCommodity = new Map<string, { price: number; date: string }>()
  for (const c of closes) {
    const front = c.contracts[0]
    if (front) frontMonthByCommodity.set(c.commodity, { price: front.close, date: c.price_date })
  }

  const { data: latestMarket } = await supabase
    .from("market_data")
    .select("data_date, feed_cost_per_cwt")
    .order("data_date", { ascending: false })
    .limit(1)
    .single()

  const classIii = frontMonthByCommodity.get("class_iii")
  const classIv = frontMonthByCommodity.get("class_iv")
  const corn = frontMonthByCommodity.get("corn")

  if (classIii || classIv || corn) {
    const targetDate = latestMarket?.data_date ?? classIii?.date ?? classIv?.date ?? corn?.date
    const upsertData: Record<string, unknown> = {
      data_date: targetDate,
      source: "databento",
    }
    if (classIii) upsertData.class_iii_price = classIii.price
    if (classIv) upsertData.class_iv_price = classIv.price
    if (corn) upsertData.corn_price = corn.price

    if (classIii && latestMarket?.feed_cost_per_cwt != null) {
      upsertData.dairy_margin =
        Math.round((classIii.price - latestMarket.feed_cost_per_cwt) * 10000) / 10000
    }

    await supabase.from("market_data").upsert(upsertData, { onConflict: "data_date" })
  }

  return {
    success: true,
    rows: upsertRows.length,
    commodities: closes.map((c) => ({
      commodity: c.commodity,
      price_date: c.price_date,
      contract_count: c.contracts.length,
      front_month: c.contracts[0] ?? null,
    })),
  }
}

// Called by cron job with x-cron-secret header
export async function POST(req: NextRequest) {
  const cronSecret = req.headers.get("x-cron-secret")
  if (cronSecret !== env.CRON_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  try {
    const body = await req.json().catch(() => ({}))
    const date = typeof body?.date === "string" ? body.date : undefined
    return NextResponse.json(await runFetch(date))
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error("Databento fetch error:", msg)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}

// Called manually from admin UI OR by Vercel Cron (which sends
// Authorization: Bearer <CRON_SECRET> automatically when CRON_SECRET env is set).
export async function GET(req: NextRequest) {
  const adminCookie = req.cookies.get("dcfo_admin")?.value
  const bearer = req.headers.get("authorization")
  const authorized =
    adminCookie === env.ADMIN_SECRET ||
    bearer === `Bearer ${env.CRON_SECRET}`
  if (!authorized) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  try {
    const date = req.nextUrl.searchParams.get("date") ?? undefined
    return NextResponse.json(await runFetch(date))
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error("Databento fetch error:", msg)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
