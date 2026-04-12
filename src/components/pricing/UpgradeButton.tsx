"use client"

import { useState } from "react"
import { ArrowRight, Loader2 } from "lucide-react"

interface UpgradeButtonProps {
  priceId: string
  label: string
  variant: "gold" | "outline-dark" | "green"
}

const variantClasses: Record<string, string> = {
  gold:           "bg-gold-600 text-white",
  "outline-dark": "bg-transparent text-ink-900 border border-cream-400",
  green:          "bg-green-800 text-white",
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

  return (
    <div>
      <button
        onClick={handleClick}
        disabled={loading}
        className={`inline-flex items-center justify-center gap-2 h-11 px-6 rounded-full text-sm font-semibold w-full transition-opacity disabled:opacity-70 ${variantClasses[variant]}`}
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
        <p className="mt-2 text-xs text-center text-error">
          {error}
        </p>
      )}
    </div>
  )
}
