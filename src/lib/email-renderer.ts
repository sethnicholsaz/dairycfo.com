// Renders a newsletter MDX to plain HTML for email delivery
// Strips MDX components to their email-safe equivalents

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
  return unit === "cwt" ? `$${val.toFixed(2)}/cwt` : `$${val.toFixed(4)}/lb`
}

function marketSnapshotHtml(market: MarketData | null): string {
  if (!market) return ""

  const date = market.data_date
    ? new Date(market.data_date + "T00:00:00").toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : ""

  const futures = market.class_iii_futures?.slice(0, 6) ?? []
  const futuresHtml =
    futures.length > 0
      ? `<tr><td colspan="2" style="padding:12px 0 4px;font-size:11px;color:#8a8068;text-transform:uppercase;letter-spacing:0.08em;">Class III Futures Strip</td></tr>
      <tr><td colspan="2" style="padding-bottom:8px;">${futures
        .map(
          (f) =>
            `<span style="display:inline-block;margin:2px 4px 2px 0;background:#fff;border:1px solid #d8d2be;border-radius:4px;padding:4px 8px;font-size:12px;"><strong>${f.month}</strong> $${f.price.toFixed(2)}</span>`
        )
        .join("")}</td></tr>`
      : ""

  return `
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f7f4ed;border:1px solid #d8d2be;border-radius:8px;overflow:hidden;margin:24px 0;">
  <tr><td style="background:#1c4a2a;padding:12px 16px;">
    <span style="color:#f7f4ed;font-family:Georgia,serif;font-weight:bold;">Dairy Market Snapshot</span>
    <span style="float:right;color:#8ab89a;font-size:12px;">${date}</span>
  </td></tr>
  <tr><td style="padding:16px;">
    <p style="font-size:11px;color:#8a8068;text-transform:uppercase;letter-spacing:0.08em;margin:0 0 12px;">Announced Prices (USDA AMS)</p>
    <table width="100%" cellpadding="0" cellspacing="0">
      <tr>
        ${[
          ["Class III", fmt(market.class_iii_price, "cwt")],
          ["Class IV", fmt(market.class_iv_price, "cwt")],
          ["Butter", fmt(market.butter_price, "lb")],
          ["Cheddar Blocks", fmt(market.cheese_blocks_price, "lb")],
          ["NFDM", fmt(market.nfdm_price, "lb")],
        ]
          .map(
            ([label, val]) =>
              `<td style="width:20%;background:#fff;border:1px solid #d8d2be;border-radius:4px;padding:8px;text-align:center;margin-right:8px;">
                <div style="font-size:10px;color:#6b6348;">${label}</div>
                <div style="font-size:16px;font-family:Georgia,serif;font-weight:bold;color:#1c4a2a;">${val}</div>
              </td>`
          )
          .join("<td width='4'></td>")}
      </tr>
      ${futuresHtml}
    </table>
  </td></tr>
  <tr><td style="background:#f0ece0;padding:8px 16px;font-size:11px;color:#8a8068;border-top:1px solid #d8d2be;">
    Announced prices via USDA AMS. Futures via Barchart. Not financial advice.
  </td></tr>
</table>`
}

export async function renderNewsletterEmail(
  content: string,
  market: MarketData | null,
  unsubscribeUrl: string
): Promise<string> {
  // Convert MDX to email-safe HTML
  // This is a simplified renderer — for production consider a proper MDX→email pipeline
  let html = content

  // Replace custom components
  html = html.replace(/<MarketSnapshot\s*\/>/g, marketSnapshotHtml(market))
  html = html.replace(/<SponsorBlock[^/]*\/>/g, "<!-- Sponsor placement (see web version) -->")

  // Basic markdown conversion
  html = html
    // Headings
    .replace(/^### (.+)$/gm, '<h3 style="font-family:Georgia,serif;color:#1c4a2a;font-size:20px;margin:24px 0 8px;">$1</h3>')
    .replace(/^## (.+)$/gm, '<h2 style="font-family:Georgia,serif;color:#1c4a2a;font-size:24px;margin:28px 0 10px;">$1</h2>')
    .replace(/^# (.+)$/gm, '<h1 style="font-family:Georgia,serif;color:#1c4a2a;font-size:32px;margin:0 0 16px;">$1</h1>')
    // Bold/italic
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>")
    // HR
    .replace(/^---$/gm, '<hr style="border:none;border-top:1px solid #d8d2be;margin:24px 0;">')
    // Paragraphs (double newline separated blocks)
    .split(/\n\n+/)
    .map((block) => {
      if (block.startsWith("<")) return block
      if (block.startsWith("- ")) {
        const items = block
          .split("\n")
          .map((l) => l.replace(/^- /, ""))
          .map((i) => `<li style="margin:4px 0;">${i}</li>`)
          .join("")
        return `<ul style="padding-left:20px;margin:12px 0;">${items}</ul>`
      }
      return `<p style="margin:0 0 16px;line-height:1.7;color:#2d2a1e;">${block}</p>`
    })
    .join("\n")

  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f7f4ed;font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f7f4ed;">
    <tr><td align="center" style="padding:24px 16px;">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">
        <!-- Header -->
        <tr><td style="background:#1c4a2a;padding:20px 28px;border-radius:8px 8px 0 0;">
          <span style="color:#f7f4ed;font-family:Georgia,serif;font-size:22px;font-weight:bold;">DairyCFO</span>
          <span style="display:block;color:#c8902a;font-size:10px;letter-spacing:0.15em;text-transform:uppercase;margin-top:2px;">Newsletter</span>
        </td></tr>
        <!-- Body -->
        <tr><td style="background:#ffffff;padding:32px 28px;border-left:1px solid #d8d2be;border-right:1px solid #d8d2be;">
          ${html}
        </td></tr>
        <!-- Footer -->
        <tr><td style="background:#1c2e1f;padding:20px 28px;border-radius:0 0 8px 8px;text-align:center;">
          <p style="color:#8ab89a;font-size:12px;margin:0 0 8px;">
            You're receiving this because you subscribed to DairyCFO.
          </p>
          <p style="margin:0;">
            <a href="${unsubscribeUrl}" style="color:#a8b8a0;font-size:11px;">Unsubscribe</a>
            &nbsp;·&nbsp;
            <a href="https://dairycfo.com" style="color:#a8b8a0;font-size:11px;">View on web</a>
          </p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`
}
