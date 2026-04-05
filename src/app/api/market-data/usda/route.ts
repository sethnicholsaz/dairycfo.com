import { NextRequest, NextResponse } from "next/server"
import { createServiceClient } from "@/lib/supabase/server"
import { fetchDairyProductPrices, fetchFeedCostInputs, fetchClassPrices } from "@/lib/usda"

async function runFetch() {
  const [products, feed, classes] = await Promise.all([
    fetchDairyProductPrices(),
    fetchFeedCostInputs(),
    fetchClassPrices(),
  ])

  const supabase = await createServiceClient()

  // Pull most recent Class III to calculate margin (it's entered manually)
  const { data: latestMarket } = await supabase
    .from("market_data")
    .select("class_iii_price")
    .not("class_iii_price", "is", null)
    .order("data_date", { ascending: false })
    .limit(1)
    .single()

  const class_iii = latestMarket?.class_iii_price ?? null
  const dairy_margin =
    class_iii != null && feed.feed_cost_per_cwt != null
      ? Math.round((class_iii - feed.feed_cost_per_cwt) * 10000) / 10000
      : null

  const { error } = await supabase.from("market_data").upsert(
    {
      data_date: products.date,
      // CME spot prices
      butter_price: products.butter,
      cheese_blocks_price: products.cheese_blocks,
      cheese_barrels_price: products.cheese_barrels,
      nfdm_price: products.nfdm,
      // Feed cost inputs
      corn_price: feed.corn_price,
      alfalfa_price: feed.alfalfa_price,
      soybean_meal_price: feed.soybean_meal_price,
      feed_cost_per_cwt: feed.feed_cost_per_cwt,
      dairy_margin,
      source: "usda_ams",
    },
    { onConflict: "data_date" }
  )

  if (error) throw error

  return {
    success: true,
    date: products.date,
    butter: products.butter,
    cheese_blocks: products.cheese_blocks,
    nfdm: products.nfdm,
    corn_price: feed.corn_price,
    alfalfa_price: feed.alfalfa_price,
    soybean_meal_price: feed.soybean_meal_price,
    feed_cost_per_cwt: feed.feed_cost_per_cwt,
    dairy_margin,
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
