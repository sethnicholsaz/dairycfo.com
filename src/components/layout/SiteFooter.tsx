import Link from "next/link"

export function SiteFooter() {
  return (
    <footer style={{ background: "#fdfcf9", borderTop: "1px solid #d8d2be" }}>
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
          <div className="md:col-span-2">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: "#1c4a2a" }}>
                <span style={{ color: "#c8902a", fontWeight: 800, fontSize: "13px", fontFamily: "Georgia, serif" }}>D</span>
              </div>
              <span style={{ fontWeight: 600, fontSize: "15px", color: "#111410", letterSpacing: "-0.01em" }}>DairyCFO</span>
            </div>
            <p className="text-sm leading-relaxed" style={{ color: "#4a5046", maxWidth: "280px" }}>
              Bringing the heartbeat of the dairy farm to creamery professionals. Market data, operations insight, and financial intelligence.
            </p>
          </div>

          <div>
            <p className="text-xs font-semibold mb-4" style={{ color: "#8a9080", letterSpacing: "0.06em", textTransform: "uppercase" }}>Publication</p>
            <ul className="space-y-3">
              {[
                { href: "/newsletters", label: "Archive" },
                { href: "/subscribe",   label: "Subscribe" },
                { href: "/sponsors",    label: "Sponsor an issue" },
              ].map(({ href, label }) => (
                <li key={href}>
                  <Link href={href} className="link-hover text-sm" style={{ color: "#4a5046" }}>{label}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="text-xs font-semibold mb-4" style={{ color: "#8a9080", letterSpacing: "0.06em", textTransform: "uppercase" }}>Account</p>
            <ul className="space-y-3">
              {[
                { href: "/subscribe",   label: "Create account" },
                { href: "/unsubscribe", label: "Unsubscribe" },
              ].map(({ href, label }) => (
                <li key={href}>
                  <Link href={href} className="link-hover text-sm" style={{ color: "#4a5046" }}>{label}</Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="flex flex-col md:flex-row items-center justify-between gap-3 pt-8" style={{ borderTop: "1px solid #d8d2be" }}>
          <p className="text-xs" style={{ color: "#8a9080" }}>© {new Date().getFullYear()} DairyCFO. All rights reserved.</p>
          <p className="text-xs" style={{ color: "#8a9080" }}>Built for creamery professionals.</p>
        </div>
      </div>
    </footer>
  )
}
