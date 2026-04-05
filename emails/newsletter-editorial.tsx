/**
 * Template A — Editorial Broadsheet
 * Newspaper masthead feel, serif-heavy, best for long-form issues.
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

interface NewsletterEditorialProps {
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

export default function NewsletterEditorial({
  issueNumber = 1,
  issueDate = "April 2026",
  title = "Class III Drops as Cheese Inventories Build Ahead of Spring",
  previewText = "Class III prices fell this week as cold storage cheese stocks rose.",
  bodyHtml = `<p style="margin:0 0 16px;line-height:1.75;font-size:16px;color:#2d2a1e;font-family:Georgia,serif;">Every spring, cows eat fresh pasture grass and their bodies respond the way you'd expect — more milk, more butterfat, more everything. Dairymen call it spring flush, and it happens like clockwork from about March through May across most of the country.</p><p style="margin:0 0 16px;line-height:1.75;font-size:16px;color:#2d2a1e;font-family:Georgia,serif;">For the creamery, spring flush means more raw milk hitting the dock at lower spot prices. For the farmer, it means the Class III price — the one that determines most of their milk check — tends to soften as supply outpaces demand.</p><h2 style="font-family:Georgia,serif;color:#1c4a2a;font-size:22px;margin:28px 0 10px;font-weight:bold;">Why Does This Affect Your Cheese Price?</h2><p style="margin:0 0 16px;line-height:1.75;font-size:16px;color:#2d2a1e;font-family:Georgia,serif;">Class III is the federal milk marketing order price tied directly to cheese. When cheese plants receive more milk than they can move, cold storage builds up. When storage builds, the spot price on the CME drops. When spot drops, the announced Class III price follows about 6 weeks later. That's the lag you'll sometimes hear dairymen grumbling about.</p><p style="margin:0 0 16px;line-height:1.75;font-size:16px;color:#2d2a1e;font-family:Georgia,serif;">This week that lag caught up — Class III fell to $17.84/cwt, down $0.22 from last month's announcement.</p>`,
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
}: NewsletterEditorialProps) {
  return (
    <Html lang="en">
      <Head />
      <Preview>{previewText}</Preview>
      <Body style={{ margin: 0, padding: 0, backgroundColor: "#f7f4ed" }}>
        <Container style={{ maxWidth: "600px", margin: "0 auto" }}>

          {/* Top green rule */}
          <Section style={{ padding: "24px 0 0" }}>
            <Hr style={{ border: "none", borderTop: "3px solid #1c4a2a", margin: 0 }} />
          </Section>

          {/* Dateline */}
          <Section style={{ backgroundColor: "#f7f4ed", padding: "10px 32px" }}>
            <Row>
              <Column>
                <Text style={{ fontSize: "11px", color: "#8a9080", letterSpacing: "0.12em", textTransform: "uppercase", margin: 0, fontFamily: "Arial, sans-serif" }}>
                  Issue #{issueNumber} · {issueDate}
                </Text>
              </Column>
              <Column style={{ textAlign: "right" }}>
                <Text style={{ fontSize: "11px", color: "#8a9080", letterSpacing: "0.12em", textTransform: "uppercase", margin: 0, fontFamily: "Arial, sans-serif" }}>
                  dairycfo.com
                </Text>
              </Column>
            </Row>
          </Section>

          {/* Masthead */}
          <Section style={{ backgroundColor: "#f7f4ed", padding: "4px 32px 16px" }}>
            <Text style={{ fontSize: "54px", fontFamily: "Georgia, serif", fontWeight: "bold", color: "#1c4a2a", margin: 0, lineHeight: "1", letterSpacing: "-0.02em" }}>
              DairyCFO
            </Text>
            <Text style={{ fontSize: "11px", color: "#c8902a", letterSpacing: "0.15em", textTransform: "uppercase", margin: "6px 0 0", fontFamily: "Arial, sans-serif" }}>
              What's Happening on the Farm
            </Text>
          </Section>

          {/* Double rule */}
          <Section style={{ padding: 0 }}>
            <Hr style={{ border: "none", borderTop: "3px solid #1c4a2a", margin: 0 }} />
            <Hr style={{ border: "none", borderTop: "1px solid #1c4a2a", margin: "3px 0 0" }} />
          </Section>

          {/* Issue headline */}
          <Section style={{ backgroundColor: "#ffffff", padding: "28px 32px 24px" }}>
            <Heading as="h1" style={{ fontSize: "30px", fontFamily: "Georgia, serif", fontWeight: "bold", color: "#111410", margin: 0, lineHeight: "1.25", letterSpacing: "-0.02em" }}>
              {title}
            </Heading>
          </Section>

          {/* Market prices strip */}
          {marketPrices.length > 0 && (
            <Section style={{ backgroundColor: "#1c4a2a", padding: "18px 32px" }}>
              <Text style={{ fontSize: "10px", color: "#8ab89a", letterSpacing: "0.12em", textTransform: "uppercase", margin: "0 0 14px", fontFamily: "Arial, sans-serif" }}>
                This Week's Prices
              </Text>
              <Row>
                {marketPrices.slice(0, 4).map((p) => (
                  <Column key={p.label} style={{ textAlign: "center" }}>
                    <Text style={{ fontSize: "22px", fontFamily: "Georgia, serif", fontWeight: "bold", color: "#ffffff", margin: 0, lineHeight: "1" }}>
                      {p.value}
                    </Text>
                    <Text style={{ fontSize: "10px", color: "#8ab89a", textTransform: "uppercase", letterSpacing: "0.08em", margin: "5px 0 0", fontFamily: "Arial, sans-serif" }}>
                      {p.label}
                    </Text>
                    <Text style={{ fontSize: "10px", color: "#4a7a5a", margin: "2px 0 0", fontFamily: "Arial, sans-serif" }}>
                      {p.unit}
                    </Text>
                  </Column>
                ))}
              </Row>
            </Section>
          )}

          {/* Body content */}
          <Section style={{ backgroundColor: "#ffffff", padding: "32px 32px 28px" }}>
            <div dangerouslySetInnerHTML={{ __html: bodyHtml }} />
          </Section>

          {/* Sponsor block */}
          {sponsorName && (
            <>
              <Section style={{ padding: "0 32px" }}>
                <Hr style={{ border: "none", borderTop: "1px solid #d8d2be", margin: 0 }} />
              </Section>
              <Section style={{ backgroundColor: "#faf8f2", padding: "20px 32px" }}>
                <Text style={{ fontSize: "10px", color: "#8a9080", letterSpacing: "0.12em", textTransform: "uppercase", margin: "0 0 8px", fontFamily: "Arial, sans-serif" }}>
                  Sponsored by
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
            </>
          )}

          {/* Footer rule */}
          <Section style={{ padding: 0 }}>
            <Hr style={{ border: "none", borderTop: "3px solid #1c4a2a", margin: 0 }} />
          </Section>

          {/* Footer */}
          <Section style={{ backgroundColor: "#1c2e1f", padding: "28px 32px" }}>
            <Text style={{ fontSize: "13px", color: "#8ab89a", margin: 0, fontFamily: "Arial, sans-serif", lineHeight: "1.6" }}>
              DairyCFO helps creamery teams understand what's happening on the dairy farms
              that supply their milk. Written by someone who's been on both sides of the tank.
            </Text>
            <Text style={{ fontSize: "11px", color: "#4a6050", margin: "14px 0 0", fontFamily: "Arial, sans-serif" }}>
              <Link href={unsubscribeUrl} style={{ color: "#6a8870", textDecoration: "none" }}>Unsubscribe</Link>
              {" · "}
              <Link href="https://dairycfo.com" style={{ color: "#6a8870", textDecoration: "none" }}>View on web</Link>
              {" · "}
              DairyCFO · PO Box 1 · Phoenix, AZ 85001
            </Text>
            <Text style={{ fontSize: "10px", color: "#3a5040", margin: "8px 0 0", fontFamily: "Arial, sans-serif" }}>
              © {new Date().getFullYear()} DairyCFO. Not financial advice.
            </Text>
          </Section>

        </Container>
      </Body>
    </Html>
  )
}

NewsletterEditorial.PreviewProps = {
  issueNumber: 1,
  issueDate: "April 2026",
  title: "Class III Drops as Cheese Inventories Build Ahead of Spring",
  previewText: "Class III prices fell this week as cold storage cheese stocks rose — here's what it means for your milk check.",
  bodyHtml: `<p style="margin:0 0 16px;line-height:1.75;font-size:16px;color:#2d2a1e;font-family:Georgia,serif;">Every spring, cows eat fresh pasture grass and their bodies respond the way you'd expect — more milk, more butterfat, more everything. Dairymen call it spring flush, and it happens like clockwork from about March through May across most of the country.</p><p style="margin:0 0 16px;line-height:1.75;font-size:16px;color:#2d2a1e;font-family:Georgia,serif;">For the creamery, spring flush means more raw milk hitting the dock at lower spot prices. For the farmer, it means the Class III price — the one that determines most of their milk check — tends to soften as supply outpaces demand.</p><h2 style="font-family:Georgia,serif;color:#1c4a2a;font-size:22px;margin:28px 0 10px;font-weight:bold;">Why Does This Affect Your Cheese Price?</h2><p style="margin:0 0 16px;line-height:1.75;font-size:16px;color:#2d2a1e;font-family:Georgia,serif;">Class III is the federal milk marketing order price tied directly to cheese. When cheese plants receive more milk than they can move, cold storage builds up. When storage builds, the spot price on the CME drops. When spot drops, the announced Class III price follows about 6 weeks later. That's the lag you'll sometimes hear dairymen grumbling about.</p><p style="margin:0 0 16px;line-height:1.75;font-size:16px;color:#2d2a1e;font-family:Georgia,serif;">This week that lag caught up — Class III fell to $17.84/cwt, down $0.22 from last month's announcement.</p>`,
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
} satisfies NewsletterEditorialProps
