import { MDXRemote } from "next-mdx-remote/rsc"
import { MarketSnapshot } from "./MarketSnapshot"
import { SponsorBlock } from "./SponsorBlock"

interface Props {
  content: string
  newsletterId: string
}

export function NewsletterRenderer({ content, newsletterId }: Props) {
  const components = {
    MarketSnapshot: () => <MarketSnapshot />,
    SponsorBlock: ({ position }: { position?: "header" | "body" | "footer" }) => (
      <SponsorBlock newsletterId={newsletterId} position={position} />
    ),
  }

  return (
    <div className="newsletter-prose">
      <MDXRemote source={content} components={components} />
    </div>
  )
}
