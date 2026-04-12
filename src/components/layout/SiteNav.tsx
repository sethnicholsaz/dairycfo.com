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
        borderBottom: scrolled ? "1px solid var(--cream-400)" : "1px solid transparent",
      }}
    >
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 bg-green-800">
            <span className="font-extrabold text-[13px] font-serif text-gold-600">D</span>
          </div>
          <span className="font-semibold text-[15px] text-ink-900 tracking-[-0.01em]">
            DairyCFO
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-8">
          {[
            { href: "/newsletters", label: "Archive" },
            { href: "/pricing",     label: "Pricing" },
            { href: "/sponsors",    label: "Sponsor" },
            { href: "/account",     label: "Account" },
          ].map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className="text-sm font-medium transition-colors duration-150 text-ink-500 hover:text-ink-900"
            >
              {label}
            </Link>
          ))}
          <Link
            href="/subscribe"
            className="inline-flex items-center h-9 px-5 rounded-full text-sm font-semibold transition-all duration-150 bg-green-800 text-white hover:bg-green-700"
          >
            Subscribe free
          </Link>
        </nav>

        {/* Mobile toggle */}
        <button
          className="md:hidden w-9 h-9 flex items-center justify-center rounded-full transition-colors text-ink-500"
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
          style={{ background: "rgba(253,252,249,0.97)", borderColor: "var(--cream-400)" }}
        >
          {[
            { href: "/newsletters", label: "Archive" },
            { href: "/pricing",     label: "Pricing" },
            { href: "/sponsors",    label: "Sponsor" },
            { href: "/account",     label: "Account" },
          ].map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className="block py-2.5 text-sm font-medium text-ink-500"
              onClick={() => setOpen(false)}
            >
              {label}
            </Link>
          ))}
          <div className="pt-2">
            <Link
              href="/subscribe"
              className="block text-center py-2.5 px-5 rounded-full text-sm font-semibold bg-green-800 text-white"
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
