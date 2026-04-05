/**
 * Template C — Data Dashboard
 * Market numbers lead the layout. Best when you have fresh price data
 * and want the snapshot to be the main event.
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
  change?: string
  changeUp?: boolean
}

interface FuturesMonth {
  month: string
  price: string
}

interface NewsletterDataProps {
  issueNumber: number
  issueDate: string
  title: string
  previewText: string
  bodyHtml: string
  marketPrices: MarketPrice[]
  futures?: FuturesMonth[]
  sponsorName?: string
  sponsorMessage?: string
  sponsorUrl?: string
  unsubscribeUrl: string
}

export default function NewsletterData({
  issueNumber,
  issueDate,
  title,
  previewText,
  bodyHtml,
  marketPrices,
  futures,
  sponsorName,
  sponsorMessage,
  sponsorUrl,
  unsubscribeUrl,
}: NewsletterDataProps) {
  return (
    <Html lang="en">
      <Tailwind config={{ presets: [pixelBasedPreset] }}>
        <Head />
        <Preview>{previewText}</Preview>
        <Body className="bg-[#1c2e1f] font-sans m-0 p-0">
          <Container className="max-w-600 mx-auto">

            {/* Header */}
            <Section className="px-32 pt-28 pb-20">
              <Row>
                <Column>
                  <Text className="text-22 font-bold text-white m-0" style={{ fontFamily: "Georgia, serif" }}>
                    DairyCFO
                  </Text>
                  <Text className="text-10 text-[#6a8870] tracking-widest uppercase m-0 mt-2">
                    Market Intelligence
                  </Text>
                </Column>
                <Column className="text-right">
                  <Text className="text-11 text-[#6a8870] m-0">
                    #{issueNumber}
                  </Text>
                  <Text className="text-11 text-[#6a8870] m-0">
                    {issueDate}
                  </Text>
                </Column>
              </Row>
            </Section>

            {/* Market prices — big and clear */}
            <Section className="px-32 pb-24">
              <Text className="text-10 text-[#6a8870] tracking-widest uppercase m-0 mb-16">
                USDA Announced Prices
              </Text>
              {marketPrices.map((p, i) => (
                <Section key={p.label} className={i < marketPrices.length - 1 ? "pb-8" : ""}>
                  <Row>
                    <Column>
                      <Text className="text-13 text-[#a8c8b0] m-0 font-sans">
                        {p.label}
                      </Text>
                    </Column>
                    <Column className="text-right">
                      <Text className="text-20 font-bold text-white m-0" style={{ fontFamily: "Georgia, serif" }}>
                        {p.value}
                        <span style={{ fontSize: "11px", color: "#6a8870", fontFamily: "sans-serif", fontWeight: "normal", marginLeft: "4px" }}>
                          {p.unit}
                        </span>
                      </Text>
                    </Column>
                    {p.change && (
                      <Column style={{ width: "60px" }} className="text-right">
                        <Text className={`text-12 m-0 ${p.changeUp ? "text-[#6abf7a]" : "text-[#d97a6a]"}`}>
                          {p.change}
                        </Text>
                      </Column>
                    )}
                  </Row>
                  {i < marketPrices.length - 1 && (
                    <Hr className="border-solid border-[#2a4030] m-0 mt-8" />
                  )}
                </Section>
              ))}
            </Section>

            {/* Futures strip */}
            {futures && futures.length > 0 && (
              <Section className="px-32 pb-24">
                <Text className="text-10 text-[#6a8870] tracking-widest uppercase m-0 mb-12">
                  Class III Futures Strip
                </Text>
                <Row>
                  {futures.slice(0, 6).map((f) => (
                    <Column key={f.month} className="text-center">
                      <Text className="text-15 font-bold text-white m-0" style={{ fontFamily: "Georgia, serif" }}>
                        {f.price}
                      </Text>
                      <Text className="text-10 text-[#6a8870] m-0 mt-2">
                        {f.month}
                      </Text>
                    </Column>
                  ))}
                </Row>
              </Section>
            )}

            {/* White content card */}
            <Section className="bg-white px-32 py-32">
              <Heading
                as="h1"
                className="text-24 font-bold text-[#1c4a2a] m-0 mb-20 leading-tight"
                style={{ fontFamily: "Georgia, serif" }}
              >
                {title}
              </Heading>
              <Text
                className="text-15 text-[#2d2a1e] leading-relaxed m-0"
                dangerouslySetInnerHTML={{ __html: bodyHtml }}
              />
            </Section>

            {/* Sponsor */}
            {sponsorName && (
              <Section className="bg-[#f7f4ed] px-32 py-20" style={{ borderTop: "1px solid #e8e4d8" }}>
                <Text className="text-10 text-[#8a9080] tracking-widest uppercase m-0 mb-8">
                  Sponsor
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

            {/* Footer */}
            <Section className="bg-[#141f16] px-32 py-24">
              <Text className="text-12 text-[#4a6050] m-0 leading-relaxed font-sans">
                You subscribed at dairycfo.com. We never sell your address.
              </Text>
              <Text className="text-11 text-[#3a4e3c] m-0 mt-8 font-sans">
                <Link href={unsubscribeUrl} className="text-[#4a6050]">
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

NewsletterData.PreviewProps = {
  issueNumber: 1,
  issueDate: "April 2026",
  title: "Class III Drops as Cheese Inventories Build Ahead of Spring",
  previewText: "Class III: $17.84 · Class IV: $18.20 · Butter: $2.61 — and what the futures strip is telling us.",
  bodyHtml: `<p>Spring flush is arriving on schedule across the Upper Midwest, and cheese plants are running hard to absorb the extra milk. Cold storage inventories built faster than expected this week, putting downward pressure on Class III.</p><p>For creameries buying milk on Class III formulas, this is a short-term tailwind — but the futures strip suggests the market expects a recovery by late Q3.</p>`,
  marketPrices: [
    { label: "Class III", value: "$17.84", unit: "/cwt", change: "-$0.22", changeUp: false },
    { label: "Class IV", value: "$18.20", unit: "/cwt", change: "+$0.08", changeUp: true },
    { label: "Butter", value: "$2.61", unit: "/lb", change: "-$0.04", changeUp: false },
    { label: "Cheddar Blocks", value: "$1.72", unit: "/lb", change: "-$0.03", changeUp: false },
    { label: "NFDM", value: "$1.24", unit: "/lb", change: "+$0.01", changeUp: true },
  ],
  futures: [
    { month: "May", price: "$18.10" },
    { month: "Jun", price: "$18.40" },
    { month: "Jul", price: "$18.75" },
    { month: "Aug", price: "$18.90" },
    { month: "Sep", price: "$19.10" },
    { month: "Oct", price: "$19.25" },
  ],
  sponsorName: "Valley Ag Supply",
  sponsorMessage: "Supplying creameries and dairies across the Southwest with equipment, parts, and technical support since 1987.",
  sponsorUrl: "https://example.com",
  unsubscribeUrl: "https://dairycfo.com/api/unsubscribe?token=preview",
} satisfies NewsletterDataProps
