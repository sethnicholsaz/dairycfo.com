"use client"

import { useState } from "react"
import { ArrowRight, Loader2 } from "lucide-react"

interface UpgradeButtonProps {
  priceId: string
  label: string
  variant: "gold" | "outline-dark" | "green"
}

export function UpgradeButton({ priceId, label, variant }: UpgradeButtonProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleClick() {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ priceId }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error ?? "Something went wrong")
        return
      }
      window.location.href = data.url
    } catch {
      setError("Network error — please try again")
    } finally {
      setLoading(false)
    }
  }

  const styles: Record<string, React.CSSProperties> = {
    gold:         { background: "#c8902a", color: "#ffffff" },
    "outline-dark": { background: "transparent", color: "#111410", border: "1.5px solid #d8d2be" },
    green:        { background: "#1c4a2a", color: "#ffffff" },
  }

  return (
    <div>
      <button
        onClick={handleClick}
        disabled={loading}
        className="inline-flex items-center justify-center gap-2 h-11 px-6 rounded-full text-sm font-semibold w-full transition-opacity"
        style={{ ...styles[variant], opacity: loading ? 0.7 : 1 }}
      >
        {loading ? (
          <Loader2 size={15} className="animate-spin" />
        ) : (
          <>
            {label}
            <ArrowRight size={14} />
          </>
        )}
      </button>
      {error && (
        <p className="mt-2 text-xs text-center" style={{ color: "#c0392b" }}>
          {error}
        </p>
      )}
    </div>
  )
}
