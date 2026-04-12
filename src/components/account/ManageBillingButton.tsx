"use client"

import { useState } from "react"
import { ExternalLink, Loader2 } from "lucide-react"

export function ManageBillingButton() {
  const [loading, setLoading] = useState(false)

  async function handleClick() {
    setLoading(true)
    try {
      const res = await fetch("/api/stripe/portal", { method: "POST" })
      const data = await res.json()
      if (data.url) window.location.href = data.url
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className="inline-flex items-center gap-1.5 text-sm font-medium shrink-0 transition-opacity"
      style={{ color: "#1c4a2a", opacity: loading ? 0.6 : 1 }}
    >
      {loading ? (
        <Loader2 size={14} className="animate-spin" />
      ) : (
        <>
          Manage billing
          <ExternalLink size={13} />
        </>
      )}
    </button>
  )
}
