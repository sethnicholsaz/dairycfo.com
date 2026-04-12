import Link from "next/link"

export function SiteFooter() {
  return (
    <footer className="bg-green-900">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
          <div className="md:col-span-2">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center bg-green-800">
                <span className="text-gold-600 font-extrabold text-[13px] font-serif">D</span>
              </div>
              <span className="font-semibold text-[15px] tracking-[-0.01em]" style={{ color: "#e8f0e4" }}>DairyCFO</span>
            </div>
            <p className="text-sm leading-relaxed max-w-[280px]" style={{ color: "#6a8870" }}>
              What&apos;s happening on the farm — explained for the professionals who serve the dairy industry.
            </p>
          </div>

          <div>
            <p className="text-xs font-semibold mb-4 uppercase tracking-[0.06em]" style={{ color: "#4a6a54" }}>Publication</p>
            <ul className="space-y-3">
              {[
                { href: "/newsletters", label: "Archive" },
                { href: "/subscribe",   label: "Subscribe" },
                { href: "/pricing",     label: "Pricing" },
                { href: "/sponsors",    label: "Sponsor an issue" },
              ].map(({ href, label }) => (
                <li key={href}>
                  <Link href={href} className="text-sm transition-colors hover:text-white" style={{ color: "#6a8870" }}>{label}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="text-xs font-semibold mb-4 uppercase tracking-[0.06em]" style={{ color: "#4a6a54" }}>Account</p>
            <ul className="space-y-3">
              {[
                { href: "/subscribe",   label: "Subscribe free" },
                { href: "/unsubscribe", label: "Unsubscribe" },
              ].map(({ href, label }) => (
                <li key={href}>
                  <Link href={href} className="text-sm transition-colors hover:text-white" style={{ color: "#6a8870" }}>{label}</Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="flex flex-col md:flex-row items-center justify-between gap-3 pt-8" style={{ borderTop: "1px solid #2a4a34" }}>
          <p className="text-xs" style={{ color: "#4a6a54" }}>© {new Date().getFullYear()} DairyCFO. All rights reserved.</p>
          <p className="text-xs" style={{ color: "#4a6a54" }}>Built for the dairy trade.</p>
        </div>
      </div>
    </footer>
  )
}
