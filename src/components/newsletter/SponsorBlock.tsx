import { createClient } from "@/lib/supabase/server"
import Image from "next/image"

interface Props {
  newsletterId: string
  position?: "header" | "body" | "footer"
}

export async function SponsorBlock({ newsletterId, position = "body" }: Props) {
  try {
    const supabase = await createClient()
    const { data: placements } = await supabase
      .from("sponsor_placements")
      .select(`
        id,
        position,
        display_order,
        sponsors (
          id,
          company,
          website,
          artwork_url
        )
      `)
      .eq("newsletter_id", newsletterId)
      .eq("position", position)
      .order("display_order")

    if (!placements || placements.length === 0) return null

    return (
      <div className="my-6">
        {placements.map((p) => {
          const sponsor = Array.isArray(p.sponsors) ? p.sponsors[0] : p.sponsors
          if (!sponsor) return null

          return (
            <div
              key={p.id}
              className="border border-cream-400 rounded-lg overflow-hidden bg-white"
            >
              <div className="bg-cream-200 px-4 py-1.5 border-b border-cream-400">
                <span className="text-[10px] text-[#8a8068] uppercase tracking-widest font-medium">
                  Sponsored by {sponsor.company}
                </span>
              </div>
              {sponsor.artwork_url ? (
                <a
                  href={sponsor.website ?? "#"}
                  target="_blank"
                  rel="noopener noreferrer sponsored"
                  className="block"
                >
                  <div className="relative w-full" style={{ aspectRatio: "4/1" }}>
                    <Image
                      src={sponsor.artwork_url}
                      alt={`${sponsor.company} advertisement`}
                      fill
                      className="object-contain"
                    />
                  </div>
                </a>
              ) : (
                <div className="p-6 text-center">
                  <a
                    href={sponsor.website ?? "#"}
                    target="_blank"
                    rel="noopener noreferrer sponsored"
                    className="font-serif text-lg font-semibold text-[#1c4a2a] hover:underline"
                  >
                    {sponsor.company}
                  </a>
                </div>
              )}
            </div>
          )
        })}
      </div>
    )
  } catch {
    return null
  }
}
