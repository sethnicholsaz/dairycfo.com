/**
 * Template A — Editorial Broadsheet
 * Newspaper masthead feel, serif-heavy, best for long-form issues.
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
}: NewsletterEditorialProps) {
  return (
    <Html lang="en">
      <Tailwind config={{ presets: [pixelBasedPreset] }}>
        <Head />
        <Preview>{previewText}</Preview>
        <Body className="bg-[#f7f4ed] font-serif m-0 p-0">
          <Container className="max-w-600 mx-auto">

            {/* Top rule */}
            <Section className="px-0 pt-24 pb-0">
              <Hr className="border-solid border-[#1c4a2a] border-t-2 m-0" />
            </Section>

            {/* Dateline */}
            <Section className="bg-[#f7f4ed] px-32 py-8">
              <Row>
                <Column>
                  <Text className="text-11 text-[#8a9080] tracking-widest uppercase m-0 font-sans">
                    Issue #{issueNumber} · {issueDate}
                  </Text>
                </Column>
                <Column className="text-right">
                  <Text className="text-11 text-[#8a9080] tracking-widest uppercase m-0 font-sans">
                    dairycfo.com
                  </Text>
                </Column>
              </Row>
            </Section>

            {/* Masthead */}
            <Section className="bg-[#f7f4ed] px-32 pb-16">
              <Text className="text-48 font-bold text-[#1c4a2a] m-0 leading-none tracking-tight">
                DairyCFO
              </Text>
              <Text className="text-12 text-[#c8902a] tracking-widest uppercase m-0 font-sans mt-4">
                What's Happening on the Farm
              </Text>
            </Section>

            <Section className="px-0">
              <Hr className="border-solid border-[#1c4a2a] border-t-2 m-0" />
              <Hr className="border-solid border-[#1c4a2a] border-t m-0 mt-2" />
            </Section>

            {/* Issue headline */}
            <Section className="bg-white px-32 pt-32 pb-0">
              <Heading
                as="h1"
                className="text-32 font-bold text-[#111410] m-0 leading-tight tracking-tight"
              >
                {title}
              </Heading>
            </Section>

            {/* Market strip */}
            {marketPrices.length > 0 && (
              <Section className="bg-[#1c4a2a] px-32 py-16 mt-24">
                <Text className="text-10 text-[#8ab89a] tracking-widest uppercase m-0 mb-12 font-sans">
                  This Week's Prices
                </Text>
                <Row>
                  {marketPrices.slice(0, 4).map((p) => (
                    <Column key={p.label} className="text-center pr-8">
                      <Text className="text-20 font-bold text-white m-0 leading-none">
                        {p.value}
                      </Text>
                      <Text className="text-9 text-[#8ab89a] uppercase tracking-wide m-0 mt-4 font-sans">
                        {p.label}
                      </Text>
                      <Text className="text-9 text-[#5a7a62] m-0 font-sans">
                        {p.unit}
                      </Text>
                    </Column>
                  ))}
                </Row>
              </Section>
            )}

            {/* Body content */}
            <Section className="bg-white px-32 py-32">
              <div
                style={{ fontSize: "16px", color: "#2d2a1e", lineHeight: "1.7" }}
                dangerouslySetInnerHTML={{ __html: bodyHtml }}
              />
            </Section>

            {/* Sponsor block */}
            {sponsorName && (
              <>
                <Section className="px-32 py-0">
                  <Hr className="border-solid border-[#d8d2be] m-0" />
                </Section>
                <Section className="bg-[#faf8f2] px-32 py-20">
                  <Text className="text-10 text-[#8a9080] tracking-widest uppercase m-0 mb-8 font-sans">
                    Sponsored by
                  </Text>
                  <Text className="text-14 font-bold text-[#1c4a2a] m-0">
                    {sponsorName}
                  </Text>
                  {sponsorMessage && (
                    <Text className="text-13 text-[#4a5046] m-0 mt-4 leading-relaxed font-sans">
                      {sponsorMessage}
                    </Text>
                  )}
                  {sponsorUrl && (
                    <Link href={sponsorUrl} className="text-12 text-[#c8902a] font-sans mt-8 block">
                      Learn more →
                    </Link>
                  )}
                </Section>
              </>
            )}

            {/* Footer */}
            <Section className="px-0">
              <Hr className="border-solid border-[#1c4a2a] border-t-2 m-0" />
            </Section>
            <Section className="bg-[#1c2e1f] px-32 py-24">
              <Text className="text-12 text-[#8ab89a] m-0 font-sans leading-relaxed">
                DairyCFO helps creamery teams understand what's happening on the dairy farms
                that supply their milk. Written by someone who's been on both sides of the tank.
              </Text>
              <Text className="text-11 text-[#4a6050] m-0 mt-12 font-sans">
                <Link href={unsubscribeUrl} className="text-[#6a8870] no-underline">
                  Unsubscribe
                </Link>
                {" · "}
                <Link href="https://dairycfo.com" className="text-[#6a8870] no-underline">
                  View on web
                </Link>
                {" · "}
                DairyCFO · PO Box 1 · Phoenix, AZ 85001
              </Text>
              <Text className="text-10 text-[#3a5040] m-0 mt-8 font-sans">
                © {new Date().getFullYear()} DairyCFO. Not financial advice.
              </Text>
            </Section>

          </Container>
        </Body>
      </Tailwind>
    </Html>
  )
}

NewsletterEditorial.PreviewProps = {
  issueNumber: 1,
  issueDate: "April 2026",
  title: "Class III Drops as Cheese Inventories Build Ahead of Spring",
  previewText: "Class III prices fell this week as cold storage cheese stocks rose — here's what it means for your milk check.",
  bodyHtml: `<p>Every spring, cows eat fresh pasture grass and their bodies respond the way you'd expect — more milk, more butterfat, more everything. Dairymen call it spring flush, and it happens like clockwork from about March through May across most of the country.</p><p>For the creamery, spring flush means more raw milk hitting the dock at lower spot prices. For the farmer, it means the Class III price — the one that determines most of their milk check — tends to soften as supply outpaces demand.</p><h2>Why Does This Affect Your Cheese Price?</h2><p>Class III is the federal milk marketing order price tied directly to cheese. When cheese plants receive more milk than they can move, cold storage builds up. When storage builds, the spot price on the CME drops. When spot drops, the announced Class III price follows about 6 weeks later. That's the lag you'll sometimes hear dairymen grumbling about.</p><p>This week that lag caught up — Class III fell to $17.84/cwt, down $0.22 from last month's announcement.</p>`,
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
