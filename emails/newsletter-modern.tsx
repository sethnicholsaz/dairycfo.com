/**
 * Template B — Modern Clean
 * White card, minimal chrome, content-first. Highest deliverability
 * text-to-image ratio. Best for shorter, punchy issues.
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
  Tailwind,
  pixelBasedPreset,
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
  issueNumber,
  issueDate,
  title,
  previewText,
  bodyHtml,
  marketPrices,
  sponsorName,
  sponsorMessage,
  sponsorUrl,
  unsubscribeUrl,
}: NewsletterModernProps) {
  return (
    <Html lang="en">
      <Tailwind config={{ presets: [pixelBasedPreset] }}>
        <Head />
        <Preview>{previewText}</Preview>
        <Body className="bg-[#f0ede6] font-sans m-0 p-0">
          <Container className="max-w-600 mx-auto py-32">

            {/* Logo bar */}
            <Section className="px-0 pb-20">
              <Row>
                <Column>
                  <Text className="text-18 font-bold text-[#1c4a2a] m-0" style={{ fontFamily: "Georgia, serif" }}>
                    DairyCFO
                  </Text>
                </Column>
                <Column className="text-right">
                  <Text className="text-12 text-[#8a9080] m-0">
                    Issue #{issueNumber} · {issueDate}
                  </Text>
                </Column>
              </Row>
            </Section>

            {/* Card */}
            <Section className="bg-white rounded-8 overflow-hidden" style={{ border: "1px solid #d8d2be" }}>

              {/* Green accent bar */}
              <Section className="bg-[#1c4a2a] px-32 py-20">
                <Heading
                  as="h1"
                  className="text-26 font-bold text-white m-0 leading-tight"
                  style={{ fontFamily: "Georgia, serif" }}
                >
                  {title}
                </Heading>
              </Section>

              {/* Market prices */}
              {marketPrices.length > 0 && (
                <Section className="px-32 py-20" style={{ borderBottom: "1px solid #f0ede6", background: "#faf9f6" }}>
                  <Text className="text-10 text-[#8a9080] tracking-widest uppercase m-0 mb-12">
                    USDA Announced Prices
                  </Text>
                  <Row>
                    {marketPrices.slice(0, 4).map((p) => (
                      <Column key={p.label} className="text-center">
                        <Text className="text-22 font-bold text-[#1c4a2a] m-0 leading-none" style={{ fontFamily: "Georgia, serif" }}>
                          {p.value}
                        </Text>
                        <Text className="text-10 text-[#8a9080] uppercase tracking-wide m-0 mt-4">
                          {p.label}
                        </Text>
                        <Text className="text-10 text-[#b0a890] m-0">
                          {p.unit}
                        </Text>
                      </Column>
                    ))}
                  </Row>
                </Section>
              )}

              {/* Body */}
              <Section className="px-32 py-28">
                <div
                  style={{ fontSize: "15px", color: "#2d2a1e", lineHeight: "1.7" }}
                  dangerouslySetInnerHTML={{ __html: bodyHtml }}
                />
              </Section>

              {/* Sponsor */}
              {sponsorName && (
                <Section className="px-32 py-20 bg-[#f7f4ed]" style={{ borderTop: "1px solid #e8e4d8" }}>
                  <Text className="text-10 text-[#8a9080] tracking-widest uppercase m-0 mb-8">
                    Partner
                  </Text>
                  <Text className="text-14 font-bold text-[#1c4a2a] m-0">
                    {sponsorName}
                  </Text>
                  {sponsorMessage && (
                    <Text className="text-13 text-[#4a5046] m-0 mt-6 leading-relaxed">
                      {sponsorMessage}
                    </Text>
                  )}
                  {sponsorUrl && (
                    <Link href={sponsorUrl} className="text-12 text-[#c8902a] mt-8 block">
                      Learn more →
                    </Link>
                  )}
                </Section>
              )}

            </Section>

            {/* Footer */}
            <Section className="px-8 pt-20 pb-32">
              <Text className="text-12 text-[#8a9080] text-center m-0">
                DairyCFO helps creamery teams understand the farms behind their milk supply —
                prices, operations, and the decisions dairymen make every day.
              </Text>
              <Text className="text-11 text-[#a8a090] text-center m-0 mt-8">
                <Link href={unsubscribeUrl} className="text-[#a8a090]">
                  Unsubscribe
                </Link>
                {" · "}
                DairyCFO · PO Box 1 · Phoenix, AZ 85001
                {" · "}© {new Date().getFullYear()}
              </Text>
            </Section>

          </Container>
        </Body>
      </Tailwind>
    </Html>
  )
}

NewsletterModern.PreviewProps = {
  issueNumber: 1,
  issueDate: "April 2026",
  title: "Class III Drops as Cheese Inventories Build Ahead of Spring",
  previewText: "Class III prices fell this week as cold storage cheese stocks rose — here's what it means for your milk check.",
  bodyHtml: `<p>Every spring, cows eat fresh pasture grass and their bodies respond the way you'd expect — more milk, more butterfat, more everything. Dairymen call it spring flush, and it happens like clockwork from about March through May across most of the country.</p><p>For the creamery, spring flush means more raw milk hitting the dock at lower spot prices. For the farmer, it means the Class III price — the one that determines most of their milk check — tends to soften as supply outpaces demand.</p><h2>Why Does This Affect Your Cheese Price?</h2><p>Class III is the federal milk marketing order price tied directly to cheese. When cheese plants receive more milk than they can move, cold storage builds up. When storage builds, the spot price on the CME drops. When spot drops, the announced Class III price follows about 6 weeks later. That's the lag you'll sometimes hear dairymen grumbling about.</p>`,
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
