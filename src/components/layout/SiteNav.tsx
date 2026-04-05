"use client"

import Link from "next/link"
import { useState, useEffect } from "react"
import { Menu, X } from "lucide-react"

export function SiteNav() {
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    function onScroll() { setScrolled(window.scrollY > 12) }
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 transition-all duration-200"
      style={{
        background: scrolled ? "rgba(253,252,249,0.92)" : "rgba(253,252,249,0.0)",
        backdropFilter: scrolled ? "blur(12px)" : "none",
        borderBottom: scrolled ? "1px solid #d8d2be" : "1px solid transparent",
      }}
    >
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
            style={{ background: "#1c4a2a" }}
          >
            <span style={{ color: "#c8902a", fontWeight: 800, fontSize: "13px", fontFamily: "Georgia, serif" }}>D</span>
          </div>
          <span style={{ fontWeight: 600, fontSize: "15px", color: "#111410", letterSpacing: "-0.01em" }}>
            DairyCFO
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-8">
          <Link
            href="/newsletters"
            className="text-sm font-medium transition-colors duration-150"
            style={{ color: "#4a5046" }}
            onMouseEnter={e => (e.currentTarget.style.color = "#111410")}
            onMouseLeave={e => (e.currentTarget.style.color = "#4a5046")}
          >
            Archive
          </Link>
          <Link
            href="/sponsors"
            className="text-sm font-medium transition-colors duration-150"
            style={{ color: "#4a5046" }}
            onMouseEnter={e => (e.currentTarget.style.color = "#111410")}
            onMouseLeave={e => (e.currentTarget.style.color = "#4a5046")}
          >
            Sponsor
          </Link>
          <Link
            href="/subscribe"
            className="inline-flex items-center h-9 px-5 rounded-full text-sm font-semibold transition-all duration-150"
            style={{ background: "#1c4a2a", color: "#ffffff" }}
            onMouseEnter={e => (e.currentTarget.style.background = "#245c33")}
            onMouseLeave={e => (e.currentTarget.style.background = "#1c4a2a")}
          >
            Subscribe free
          </Link>
        </nav>

        {/* Mobile toggle */}
        <button
          className="md:hidden w-9 h-9 flex items-center justify-center rounded-full transition-colors"
          style={{ color: "#4a5046" }}
          onClick={() => setOpen(!open)}
          aria-label="Toggle menu"
        >
          {open ? <X size={18} /> : <Menu size={18} />}
        </button>
      </div>

      {/* Mobile drawer */}
      {open && (
        <div
          className="md:hidden border-t px-6 py-4 space-y-1"
          style={{ background: "rgba(253,252,249,0.97)", borderColor: "#d8d2be" }}
        >
          <Link href="/newsletters" className="block py-2.5 text-sm font-medium" style={{ color: "#4a5046" }} onClick={() => setOpen(false)}>Archive</Link>
          <Link href="/sponsors" className="block py-2.5 text-sm font-medium" style={{ color: "#4a5046" }} onClick={() => setOpen(false)}>Sponsor</Link>
          <div className="pt-2">
            <Link
              href="/subscribe"
              className="block text-center py-2.5 px-5 rounded-full text-sm font-semibold"
              style={{ background: "#1c4a2a", color: "#ffffff" }}
              onClick={() => setOpen(false)}
            >
              Subscribe free
            </Link>
          </div>
        </div>
      )}
    </header>
  )
}
