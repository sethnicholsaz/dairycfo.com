import { env } from "@/lib/env"

export interface SearchResult {
  title: string
  url: string
  description: string
}

interface BraveWebResult {
  title?: string
  url?: string
  description?: string
}

interface BraveSearchResponse {
  web?: {
    results?: BraveWebResult[]
  }
}

export async function braveSearch(
  query: string,
  options?: { count?: number; freshness?: string }
): Promise<SearchResult[]> {
  if (!env.BRAVE_API_KEY) {
    throw new Error("BRAVE_API_KEY is not configured")
  }

  const params = new URLSearchParams({ q: query })
  if (options?.count) params.set("count", String(options.count))
  if (options?.freshness) params.set("freshness", options.freshness)

  const res = await fetch(
    `https://api.search.brave.com/res/v1/web/search?${params}`,
    {
      headers: {
        Accept: "application/json",
        "Accept-Encoding": "gzip",
        "X-Subscription-Token": env.BRAVE_API_KEY,
      },
    }
  )

  if (!res.ok) {
    throw new Error(`Brave Search API error: ${res.status} ${res.statusText}`)
  }

  const data: BraveSearchResponse = await res.json()
  const results = data.web?.results ?? []

  return results.map((r) => ({
    title: r.title ?? "",
    url: r.url ?? "",
    description: r.description ?? "",
  }))
}
