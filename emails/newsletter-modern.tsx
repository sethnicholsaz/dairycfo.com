/**
 * Template B — Modern Clean
 * White card, minimal chrome, content-first.
 * All styles inline for maximum email client compatibility.
 */
import {
  Html,
  Head,
  Preview,
  Body,
  Container,
  Section,
  Row,
  Column,
  Heading,
  Text,
  Hr,
  Link,
} from "@react-email/components"

interface MarketPrice {
  label: string
  value: string
  unit: string
}

interface NewsletterModernProps {
  issueNumber: number
  issueDate: string
  title: string
  previewText: string
  bodyHtml: string
  marketPrices: MarketPrice[]
  sponsorName?: string
  sponsorMessage?: string
  sponsorUrl?: string
  unsubscribeUrl: string
}

export default function NewsletterModern({
  issueNumber = 1,
  issueDate = "April 2026",
  title = "Class III Drops as Cheese Inventories Build Ahead of Spring",
  previewText = "Class III prices fell this week as cold storage cheese stocks rose.",
  bodyHtml = `<p style="margin:0 0 16px;line-height:1.75;font-size:16px;color:#2d2a1e;font-family:Georgia,serif;">Every spring, cows eat fresh pasture grass and their bodies respond the way you'd expect — more milk, more butterfat, more everything. Dairymen call it spring flush, and it happens like clockwork from about March through May across most of the country.</p><p style="margin:0 0 16px;line-height:1.75;font-size:16px;color:#2d2a1e;font-family:Georgia,serif;">For the creamery, spring flush means more raw milk hitting the dock at lower spot prices. For the farmer, it means the Class III price — the one that determines most of their milk check — tends to soften as supply outpaces demand.</p><h2 style="font-family:Georgia,serif;color:#1c4a2a;font-size:22px;margin:28px 0 10px;font-weight:bold;">Why Does This Affect Your Cheese Price?</h2><p style="margin:0 0 16px;line-height:1.75;font-size:16px;color:#2d2a1e;font-family:Georgia,serif;">Class III is the federal milk marketing order price tied directly to cheese. When cheese plants receive more milk than they can move, cold storage builds up. When storage builds, the spot price on the CME drops. When spot drops, the announced Class III price follows about 6 weeks later. That's the lag you'll sometimes hear dairymen grumbling about.</p><p style="margin:0 0 0;line-height:1.75;font-size:16px;color:#2d2a1e;font-family:Georgia,serif;">This week that lag caught up — Class III fell to $17.84/cwt, down $0.22 from last month's announcement.</p>`,
  marketPrices = [
    { label: "Class III", value: "$17.84", unit: "/cwt" },
    { label: "Class IV", value: "$18.20", unit: "/cwt" },
    { label: "Butter", value: "$2.61", unit: "/lb" },
    { label: "Cheddar", value: "$1.72", unit: "/lb" },
  ],
  sponsorName = "Valley Ag Supply",
  sponsorMessage = "Supplying creameries and dairies across the Southwest with equipment, parts, and technical support since 1987.",
  sponsorUrl = "https://example.com",
  unsubscribeUrl = "https://dairycfo.com/api/unsubscribe?token=preview",
}: NewsletterModernProps) {
  return (
    <Html lang="en">
      <Head />
      <Preview>{previewText}</Preview>
      <Body style={{ margin: 0, padding: 0, backgroundColor: "#f0ede6" }}>
        <Container style={{ maxWidth: "600px", margin: "0 auto", padding: "32px 0" }}>

          {/* Logo bar */}
          <Section style={{ padding: "0 0 20px" }}>
            <Row>
              <Column>
                <Text style={{ fontSize: "26px", fontFamily: "Georgia, serif", fontWeight: "bold", color: "#1c4a2a", margin: 0, letterSpacing: "-0.01em" }}>
                  DairyCFO
                </Text>
              </Column>
              <Column style={{ textAlign: "right" }}>
                <Text style={{ fontSize: "12px", color: "#8a9080", margin: 0, fontFamily: "Arial, sans-serif" }}>
                  Issue #{issueNumber} · {issueDate}
                </Text>
              </Column>
            </Row>
          </Section>

          {/* Card */}
          <Section style={{ backgroundColor: "#ffffff", borderRadius: "8px", border: "1px solid #d8d2be" }}>

            {/* Green header bar with title */}
            <Section style={{ backgroundColor: "#1c4a2a", padding: "24px 32px", borderRadius: "8px 8px 0 0" }}>
              <Heading as="h1" style={{ fontSize: "26px", fontFamily: "Georgia, serif", fontWeight: "bold", color: "#ffffff", margin: 0, lineHeight: "1.3" }}>
                {title}
              </Heading>
            </Section>

            {/* Market prices */}
            {marketPrices.length > 0 && (
              <Section style={{ backgroundColor: "#faf9f6", padding: "18px 32px", borderBottom: "1px solid #f0ede6" }}>
                <Text style={{ fontSize: "10px", color: "#8a9080", letterSpacing: "0.12em", textTransform: "uppercase", margin: "0 0 14px", fontFamily: "Arial, sans-serif" }}>
                  USDA Announced Prices
                </Text>
                <Row>
                  {marketPrices.slice(0, 4).map((p) => (
                    <Column key={p.label} style={{ textAlign: "center" }}>
                      <Text style={{ fontSize: "22px", fontFamily: "Georgia, serif", fontWeight: "bold", color: "#1c4a2a", margin: 0, lineHeight: "1" }}>
                        {p.value}
                      </Text>
                      <Text style={{ fontSize: "10px", color: "#8a9080", textTransform: "uppercase", letterSpacing: "0.08em", margin: "5px 0 0", fontFamily: "Arial, sans-serif" }}>
                        {p.label}
                      </Text>
                      <Text style={{ fontSize: "10px", color: "#b0a890", margin: "2px 0 0", fontFamily: "Arial, sans-serif" }}>
                        {p.unit}
                      </Text>
                    </Column>
                  ))}
                </Row>
              </Section>
            )}

            {/* Body */}
            <Section style={{ padding: "28px 32px" }}>
              <div dangerouslySetInnerHTML={{ __html: bodyHtml }} />
            </Section>

            {/* Sponsor */}
            {sponsorName && (
              <Section style={{ backgroundColor: "#f7f4ed", padding: "20px 32px", borderTop: "1px solid #e8e4d8", borderRadius: "0 0 8px 8px" }}>
                <Text style={{ fontSize: "10px", color: "#8a9080", letterSpacing: "0.12em", textTransform: "uppercase", margin: "0 0 8px", fontFamily: "Arial, sans-serif" }}>
                  Partner
                </Text>
                <Text style={{ fontSize: "15px", fontWeight: "bold", color: "#1c4a2a", margin: 0, fontFamily: "Georgia, serif" }}>
                  {sponsorName}
                </Text>
                {sponsorMessage && (
                  <Text style={{ fontSize: "13px", color: "#4a5046", margin: "6px 0 0", lineHeight: "1.6", fontFamily: "Arial, sans-serif" }}>
                    {sponsorMessage}
                  </Text>
                )}
                {sponsorUrl && (
                  <Link href={sponsorUrl} style={{ fontSize: "12px", color: "#c8902a", display: "block", marginTop: "10px", fontFamily: "Arial, sans-serif" }}>
                    Learn more →
                  </Link>
                )}
              </Section>
            )}

          </Section>

          {/* Footer */}
          <Section style={{ padding: "20px 8px 32px" }}>
            <Text style={{ fontSize: "12px", color: "#8a9080", textAlign: "center", margin: 0, fontFamily: "Arial, sans-serif", lineHeight: "1.6" }}>
              DairyCFO helps creamery teams understand the farms behind their milk supply — prices, operations, and the decisions dairymen make every day.
            </Text>
            <Text style={{ fontSize: "11px", color: "#a8a090", textAlign: "center", margin: "10px 0 0", fontFamily: "Arial, sans-serif" }}>
              <Link href={unsubscribeUrl} style={{ color: "#a8a090", textDecoration: "none" }}>Unsubscribe</Link>
              {" · "}
              DairyCFO · PO Box 1 · Phoenix, AZ 85001
              {" · "}© {new Date().getFullYear()}
            </Text>
          </Section>

        </Container>
      </Body>
    </Html>
  )
}

NewsletterModern.PreviewProps = {
  issueNumber: 1,
  issueDate: "April 2026",
  title: "Class III Drops as Cheese Inventories Build Ahead of Spring",
  previewText: "Class III prices fell this week as cold storage cheese stocks rose — here's what it means for your milk check.",
  bodyHtml: `<p style="margin:0 0 16px;line-height:1.75;font-size:16px;color:#2d2a1e;font-family:Georgia,serif;">Every spring, cows eat fresh pasture grass and their bodies respond the way you'd expect — more milk, more butterfat, more everything. Dairymen call it spring flush, and it happens like clockwork from about March through May across most of the country.</p><p style="margin:0 0 16px;line-height:1.75;font-size:16px;color:#2d2a1e;font-family:Georgia,serif;">For the creamery, spring flush means more raw milk hitting the dock at lower spot prices. For the farmer, it means the Class III price — the one that determines most of their milk check — tends to soften as supply outpaces demand.</p><h2 style="font-family:Georgia,serif;color:#1c4a2a;font-size:22px;margin:28px 0 10px;font-weight:bold;">Why Does This Affect Your Cheese Price?</h2><p style="margin:0 0 16px;line-height:1.75;font-size:16px;color:#2d2a1e;font-family:Georgia,serif;">Class III is the federal milk marketing order price tied directly to cheese. When cheese plants receive more milk than they can move, cold storage builds up. When storage builds, the spot price on the CME drops. When spot drops, the announced Class III price follows about 6 weeks later. That's the lag you'll sometimes hear dairymen grumbling about.</p><p style="margin:0;line-height:1.75;font-size:16px;color:#2d2a1e;font-family:Georgia,serif;">This week that lag caught up — Class III fell to $17.84/cwt, down $0.22 from last month's announcement.</p>`,
  marketPrices: [
    { label: "Class III", value: "$17.84", unit: "/cwt" },
    { label: "Class IV", value: "$18.20", unit: "/cwt" },
    { label: "Butter", value: "$2.61", unit: "/lb" },
    { label: "Cheddar", value: "$1.72", unit: "/lb" },
  ],
  sponsorName: "Valley Ag Supply",
  sponsorMessage: "Supplying creameries and dairies across the Southwest with equipment, parts, and technical support since 1987.",
  sponsorUrl: "https://example.com",
  unsubscribeUrl: "https://dairycfo.com/api/unsubscribe?token=preview",
} satisfies NewsletterModernProps
