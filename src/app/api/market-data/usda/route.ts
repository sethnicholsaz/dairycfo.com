import { NextRequest, NextResponse } from "next/server"
import { createServiceClient } from "@/lib/supabase/server"
import { fetchDairyProductPrices, fetchClassPrices } from "@/lib/usda"

async function runFetch() {
  const [products, classes] = await Promise.all([
    fetchDairyProductPrices(),
    fetchClassPrices(),
  ])

  const supabase = await createServiceClient()

  const { error } = await supabase.from("market_data").upsert(
    {
      data_date: products.date,
      class_iii_price: classes.class_iii,
      class_iv_price: classes.class_iv,
      butter_price: products.butter,
      cheese_blocks_price: products.cheese_blocks,
      cheese_barrels_price: products.cheese_barrels,
      nfdm_price: products.nfdm,
      source: "usda_ams",
    },
    { onConflict: "data_date" }
  )

  if (error) throw error

  return {
    success: true,
    date: products.date,
    class_iii: classes.class_iii,
    class_iv: classes.class_iv,
    butter: products.butter,
    cheese_blocks: products.cheese_blocks,
    nfdm: products.nfdm,
  }
}

// Called by cron job with x-cron-secret header
export async function POST(req: NextRequest) {
  const cronSecret = req.headers.get("x-cron-secret")
  if (cronSecret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    return NextResponse.json(await runFetch())
  } catch (err) {
    console.error("USDA fetch error:", err)
    return NextResponse.json({ error: "Fetch failed" }, { status: 500 })
  }
}

// Called manually from admin UI
export async function GET(req: NextRequest) {
  const adminCookie = req.cookies.get("dcfo_admin")?.value
  if (adminCookie !== process.env.ADMIN_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    return NextResponse.json(await runFetch())
  } catch (err) {
    console.error("USDA fetch error:", err)
    return NextResponse.json({ error: "Fetch failed" }, { status: 500 })
  }
}
