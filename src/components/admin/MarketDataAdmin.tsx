"use client"

import { useState } from "react"
import { RefreshCw, Upload } from "lucide-react"

interface MarketRow {
  id: string
  data_date: string
  class_iii_price: number | null
  class_iv_price: number | null
  butter_price: number | null
  cheese_blocks_price: number | null
  nfdm_price: number | null
  corn_price: number | null
  alfalfa_price: number | null
  soybean_meal_price: number | null
  feed_cost_per_cwt: number | null
  dairy_margin: number | null
  class_iii_futures: { month: string; price: number }[] | null
  source: string
}

interface Props {
  recent: MarketRow[]
}

function fmt(v: number | null) {
  return v != null ? `$${v.toFixed(2)}` : "—"
}

export function MarketDataAdmin({ recent }: Props) {
  const [fetching, setFetching] = useState(false)
  const [fetchMsg, setFetchMsg] = useState("")
  const [uploadType, setUploadType] = useState("class_iii")
  const [uploading, setUploading] = useState(false)
  const [uploadMsg, setUploadMsg] = useState("")
  const [uploadFile, setUploadFile] = useState<File | null>(null)

  async function fetchUsda() {
    setFetching(true)
    setFetchMsg("")
    try {
      const res = await fetch("/api/market-data/usda")
      const data = await res.json()
      if (res.ok) {
        setFetchMsg(`✓ Fetched — Butter: ${data.butter ? "$" + data.butter : "n/a"} · Feed cost: ${data.feed_cost_per_cwt ? "$" + data.feed_cost_per_cwt.toFixed(2) + "/cwt" : "n/a"} · Margin: ${data.dairy_margin ? "$" + data.dairy_margin.toFixed(2) + "/cwt" : "enter Class III to calculate"}`)
      } else {
        setFetchMsg("Error: " + data.error)
      }
    } catch {
      setFetchMsg("Network error")
    } finally {
      setFetching(false)
    }
  }

  async function uploadFutures(e: React.FormEvent) {
    e.preventDefault()
    if (!uploadFile) return
    setUploading(true)
    setUploadMsg("")

    const fd = new FormData()
    fd.append("file", uploadFile)
    fd.append("type", uploadType)

    try {
      const res = await fetch("/api/market-data/upload", { method: "POST", body: fd })
      const data = await res.json()
      if (res.ok) {
        setUploadMsg(`✓ Imported ${data.rows} rows. Sample: ${data.sample?.map((r: {month:string;price:number}) => `${r.month} $${r.price}`).join(", ")}`)
        setUploadFile(null)
      } else {
        setUploadMsg("Error: " + data.error)
      }
    } catch {
      setUploadMsg("Network error")
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="space-y-10">
      {/* USDA fetch */}
      <div className="bg-white rounded-lg border border-[#d8d2be] p-6">
        <h2 className="font-serif text-lg font-semibold text-[#1c2e1f] mb-1">
          USDA AMS — Announced Prices
        </h2>
        <p className="text-sm text-[#6b6348] mb-4">
          Fetches butter, cheese, NFDM, and Class III/IV announced prices from the USDA AMS API.
        </p>
        <div className="flex items-center gap-4">
          <button
            onClick={fetchUsda}
            disabled={fetching}
            className="inline-flex items-center gap-2 bg-[#1c4a2a] text-[#f7f4ed] px-4 py-2 rounded-md text-sm font-medium hover:bg-[#163d22] transition-colors disabled:opacity-50"
          >
            <RefreshCw size={14} className={fetching ? "animate-spin" : ""} />
            {fetching ? "Fetching..." : "Fetch Now"}
          </button>
          {fetchMsg && (
            <span className={`text-sm font-medium ${fetchMsg.startsWith("Error") ? "text-red-500" : "text-[#1c4a2a]"}`}>
              {fetchMsg}
            </span>
          )}
        </div>
        <p className="text-xs text-[#8a8068] mt-3">
          Set up a daily cron job (Vercel Cron or external) to POST{" "}
          <code className="bg-[#f7f4ed] px-1 py-0.5 rounded">/api/market-data/usda</code> with{" "}
          <code className="bg-[#f7f4ed] px-1 py-0.5 rounded">x-cron-secret</code> header.
        </p>
      </div>

      {/* Barchart Excel upload */}
      <div className="bg-white rounded-lg border border-[#d8d2be] p-6">
        <h2 className="font-serif text-lg font-semibold text-[#1c2e1f] mb-1">
          Barchart — Futures Data Upload
        </h2>
        <p className="text-sm text-[#6b6348] mb-4">
          Export futures data from Barchart as Excel (.xlsx), then upload here.
          Expected columns: <strong>A = Contract Month</strong>, <strong>B = Last Price</strong>.
        </p>

        <form onSubmit={uploadFutures} className="space-y-4">
          <div className="flex gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#2d2a1e] uppercase tracking-wider mb-1">
                Data Type
              </label>
              <select
                value={uploadType}
                onChange={(e) => setUploadType(e.target.value)}
                className="px-3 py-2 border border-[#d8d2be] rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#1c4a2a] bg-white"
              >
                <option value="class_iii">Class III Futures</option>
                <option value="class_iv">Class IV Futures</option>
                <option value="corn">Corn Futures</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#2d2a1e] uppercase tracking-wider mb-1">
              Excel File
            </label>
            <div className="border-2 border-dashed border-[#d8d2be] rounded-md p-4">
              <input
                type="file"
                accept=".xlsx,.xls,.csv"
                onChange={(e) => setUploadFile(e.target.files?.[0] ?? null)}
                className="hidden"
                id="futures-upload"
              />
              <label htmlFor="futures-upload" className="cursor-pointer block text-center">
                {uploadFile ? (
                  <span className="text-sm text-[#1c4a2a] font-medium">{uploadFile.name}</span>
                ) : (
                  <div>
                    <Upload size={20} className="text-[#8a8068] mx-auto mb-1" />
                    <span className="text-sm text-[#6b6348]">Click to select .xlsx file</span>
                  </div>
                )}
              </label>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button
              type="submit"
              disabled={uploading || !uploadFile}
              className="inline-flex items-center gap-2 bg-[#1c4a2a] text-[#f7f4ed] px-4 py-2 rounded-md text-sm font-medium hover:bg-[#163d22] transition-colors disabled:opacity-50"
            >
              <Upload size={14} />
              {uploading ? "Importing..." : "Import Futures"}
            </button>
            {uploadMsg && (
              <span className={`text-sm font-medium ${uploadMsg.startsWith("Error") ? "text-red-500" : "text-[#1c4a2a]"}`}>
                {uploadMsg}
              </span>
            )}
          </div>
        </form>
      </div>

      {/* Market prices table */}
      <div className="bg-white rounded-lg border border-[#d8d2be] overflow-hidden">
        <div className="px-6 py-4 border-b border-[#d8d2be]">
          <h2 className="font-semibold text-[#1c2e1f]">Market Prices</h2>
          <p className="text-xs text-[#8a8068] mt-0.5">Class III/IV entered manually · Spot prices auto-fetched from CME via USDA</p>
        </div>
        {recent.length === 0 ? (
          <div className="px-6 py-10 text-center text-sm text-[#8a8068]">
            No market data yet. Click Fetch Now above.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs text-[#8a8068] uppercase tracking-wider border-b border-[#d8d2be] bg-[#fdfcf9]">
                  <th className="px-4 py-3 text-left">Date</th>
                  <th className="px-4 py-3 text-right">Class III</th>
                  <th className="px-4 py-3 text-right">Class IV</th>
                  <th className="px-4 py-3 text-right">Butter</th>
                  <th className="px-4 py-3 text-right">Cheese Blk</th>
                  <th className="px-4 py-3 text-right">NFDM</th>
                </tr>
              </thead>
              <tbody>
                {recent.map((row) => (
                  <tr key={row.id} className="border-b border-[#f0ece0] last:border-0">
                    <td className="px-4 py-3 font-medium text-[#1c2e1f]">
                      {new Date(row.data_date + "T00:00:00").toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-right">{fmt(row.class_iii_price)}</td>
                    <td className="px-4 py-3 text-right">{fmt(row.class_iv_price)}</td>
                    <td className="px-4 py-3 text-right">{fmt(row.butter_price)}</td>
                    <td className="px-4 py-3 text-right">{fmt(row.cheese_blocks_price)}</td>
                    <td className="px-4 py-3 text-right">{fmt(row.nfdm_price)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Feed cost + margin table */}
      <div className="bg-white rounded-lg border border-[#d8d2be] overflow-hidden">
        <div className="px-6 py-4 border-b border-[#d8d2be]">
          <h2 className="font-semibold text-[#1c2e1f]">Feed Cost & Dairy Margin</h2>
          <p className="text-xs text-[#8a8068] mt-0.5">DMC formula: 60 lbs corn + 27.4 lbs alfalfa + 14.7 lbs soybean meal per cwt · Margin = Class III − Feed Cost</p>
        </div>
        {recent.length === 0 ? (
          <div className="px-6 py-10 text-center text-sm text-[#8a8068]">No data yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs text-[#8a8068] uppercase tracking-wider border-b border-[#d8d2be] bg-[#fdfcf9]">
                  <th className="px-4 py-3 text-left">Date</th>
                  <th className="px-4 py-3 text-right">Corn /bu</th>
                  <th className="px-4 py-3 text-right">Alfalfa /ton</th>
                  <th className="px-4 py-3 text-right">SBM /ton</th>
                  <th className="px-4 py-3 text-right">Feed Cost /cwt</th>
                  <th className="px-4 py-3 text-right">Margin /cwt</th>
                </tr>
              </thead>
              <tbody>
                {recent.map((row) => (
                  <tr key={row.id} className="border-b border-[#f0ece0] last:border-0">
                    <td className="px-4 py-3 font-medium text-[#1c2e1f]">
                      {new Date(row.data_date + "T00:00:00").toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-right">{fmt(row.corn_price)}</td>
                    <td className="px-4 py-3 text-right">{row.alfalfa_price != null ? `$${row.alfalfa_price}` : "—"}</td>
                    <td className="px-4 py-3 text-right">{row.soybean_meal_price != null ? `$${row.soybean_meal_price}` : "—"}</td>
                    <td className="px-4 py-3 text-right font-medium">{fmt(row.feed_cost_per_cwt)}</td>
                    <td className="px-4 py-3 text-right">
                      {row.dairy_margin != null ? (
                        <span className={`font-semibold ${row.dairy_margin >= 8 ? "text-[#1c4a2a]" : row.dairy_margin >= 4 ? "text-amber-600" : "text-red-600"}`}>
                          {fmt(row.dairy_margin)}
                        </span>
                      ) : (
                        <span className="text-xs text-[#8a8068]">need Class III</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
