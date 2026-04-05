import { render } from "@react-email/components"
import { createElement } from "react"

// Import whichever template is active — swap this to change the newsletter look
import NewsletterData from "../../emails/newsletter-data"

interface MarketData {
  data_date: string
  class_iii_price: number | null
  class_iv_price: number | null
  butter_price: number | null
  cheese_blocks_price: number | null
  nfdm_price: number | null
  class_iii_futures: { month: string; price: number }[] | null
}

function fmt(val: number | null, unit: "cwt" | "lb"): string {
  if (val === null) return "—"
  return unit === "cwt" ? `$${val.toFixed(2)}` : `$${val.toFixed(4)}`
}

export async function renderNewsletterEmail(
  mdxContent: string,
  market: MarketData | null,
  unsubscribeUrl: string,
  meta: {
    title: string
    issueNumber?: number | null
    publishedAt?: string | null
  }
): Promise<string> {
  const issueDate = meta.publishedAt
    ? new Date(meta.publishedAt).toLocaleDateString("en-US", { month: "long", year: "numeric" })
    : new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" })

  const marketPrices = market
    ? [
        { label: "Class III", value: fmt(market.class_iii_price, "cwt"), unit: "/cwt" },
        { label: "Class IV", value: fmt(market.class_iv_price, "cwt"), unit: "/cwt" },
        { label: "Butter", value: fmt(market.butter_price, "lb"), unit: "/lb" },
        { label: "Cheddar Blocks", value: fmt(market.cheese_blocks_price, "lb"), unit: "/lb" },
        { label: "NFDM", value: fmt(market.nfdm_price, "lb"), unit: "/lb" },
      ].filter((p) => p.value !== "—")
    : []

  const futures = market?.class_iii_futures?.slice(0, 6).map((f) => ({
    month: f.month,
    price: `$${f.price.toFixed(2)}`,
  }))

  // Convert MDX content to plain HTML paragraphs for the email body
  // (strips MDX components — they're replaced by the template's native sections)
  const bodyHtml = mdxContent
    .replace(/<MarketSnapshot\s*\/>/g, "")
    .replace(/<SponsorBlock[^/]*\/>/g, "")
    .replace(/^### (.+)$/gm, '<h3 style="font-family:Georgia,serif;color:#1c4a2a;font-size:18px;margin:20px 0 8px;">$1</h3>')
    .replace(/^## (.+)$/gm, '<h2 style="font-family:Georgia,serif;color:#1c4a2a;font-size:22px;margin:24px 0 10px;">$1</h2>')
    .replace(/^# (.+)$/gm, '<h1 style="font-family:Georgia,serif;color:#1c4a2a;font-size:28px;margin:0 0 14px;">$1</h1>')
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>")
    .replace(/^---$/gm, '<hr style="border:none;border-top:1px solid #d8d2be;margin:20px 0;">')
    .split(/\n\n+/)
    .map((block) => {
      if (block.trim() === "") return ""
      if (block.startsWith("<")) return block
      if (block.startsWith("- ")) {
        const items = block
          .split("\n")
          .filter((l) => l.startsWith("- "))
          .map((l) => `<li style="margin:4px 0;">${l.replace(/^- /, "")}</li>`)
          .join("")
        return `<ul style="padding-left:20px;margin:12px 0;">${items}</ul>`
      }
      return `<p style="margin:0 0 14px;line-height:1.7;">${block.trim()}</p>`
    })
    .filter(Boolean)
    .join("\n")

  const html = await render(
    createElement(NewsletterData, {
      issueNumber: meta.issueNumber ?? 1,
      issueDate,
      title: meta.title,
      previewText: meta.title,
      bodyHtml,
      marketPrices,
      futures,
      unsubscribeUrl,
    })
  )

  return html
}
