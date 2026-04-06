// Beehiiv API v2
// Handles subscriber sync and newsletter post creation

const BEEHIIV_BASE = "https://api.beehiiv.com/v2"
const API_KEY = process.env.BEEHIIV_API_KEY!
const PUB_ID = process.env.BEEHIIV_PUBLICATION_ID!

function headers() {
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${API_KEY}`,
  }
}

// Add or reactivate a subscriber in Beehiiv
export async function addBeehiivSubscriber(email: string, name?: string | null) {
  if (!API_KEY || !PUB_ID) return

  const [firstName, ...rest] = (name ?? "").trim().split(" ")
  const lastName = rest.join(" ") || undefined

  const res = await fetch(`${BEEHIIV_BASE}/publications/${PUB_ID}/subscriptions`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify({
      email,
      reactivate_existing: true,
      send_welcome_email: false, // we send our own welcome via Resend
      utm_source: "website",
      ...(firstName ? { first_name: firstName } : {}),
      ...(lastName ? { last_name: lastName } : {}),
    }),
  })

  if (!res.ok) {
    const err = await res.text()
    console.error("Beehiiv subscribe error:", err)
  }
}

// Unsubscribe a contact in Beehiiv by email
export async function unsubscribeBeehiivSubscriber(email: string) {
  if (!API_KEY || !PUB_ID) return

  // Look up the subscription ID first
  const searchRes = await fetch(
    `${BEEHIIV_BASE}/publications/${PUB_ID}/subscriptions?email=${encodeURIComponent(email)}&limit=1`,
    { headers: headers() }
  )

  if (!searchRes.ok) return

  const { data } = await searchRes.json()
  const subscriptionId = data?.[0]?.id
  if (!subscriptionId) return

  // Mark as inactive
  const res = await fetch(
    `${BEEHIIV_BASE}/publications/${PUB_ID}/subscriptions/${subscriptionId}`,
    {
      method: "PATCH",
      headers: headers(),
      body: JSON.stringify({ status: "inactive" }),
    }
  )

  if (!res.ok) {
    const err = await res.text()
    console.error("Beehiiv unsubscribe error:", err)
  }
}

// Create a post in Beehiiv and optionally send it
// status: "draft" = save for review, "confirmed" = send immediately
export async function createBeehiivPost(opts: {
  title: string
  subtitle?: string
  contentHtml: string
  status?: "draft" | "confirmed"
}): Promise<{ id: string; url: string | null } | null> {
  if (!API_KEY || !PUB_ID) {
    console.error("Beehiiv API key or publication ID not set")
    return null
  }

  const payload = {
    title: opts.title,
    subtitle: opts.subtitle ?? "",
    content_html: opts.contentHtml,
    status: opts.status ?? "draft",
    audience: "all",
  }

  const res = await fetch(`${BEEHIIV_BASE}/publications/${PUB_ID}/posts`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify(payload),
  })

  if (!res.ok) {
    const err = await res.text()
    console.error(`Beehiiv create post error (${res.status}):`, err)
    console.error("Payload sent:", JSON.stringify({ ...payload, content_html: `[${payload.content_html.length} chars]` }))
    return null
  }

  const { data } = await res.json()
  return { id: data.id, url: data.web_url ?? null }
}
