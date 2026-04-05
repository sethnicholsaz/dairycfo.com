"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowRight } from "lucide-react"

export function SubscribeInlineForm({ light = false, large = false }: { light?: boolean; large?: boolean }) {
  const [email, setEmail] = useState("")
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle")
  const [message, setMessage] = useState("")
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email) return
    setStatus("loading")

    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })
      const data = await res.json()
      if (!res.ok) {
        setStatus("error")
        setMessage(data.error ?? "Something went wrong.")
        return
      }
      setStatus("success")
      setTimeout(() => { router.push("/newsletters"); router.refresh() }, 1200)
    } catch {
      setStatus("error")
      setMessage("Network error. Please try again.")
    }
  }

  if (status === "success") {
    return (
      <p className={`font-medium ${light ? "text-white" : "text-[#1c4a2a]"}`}>
        ✓ You&apos;re in — taking you to the archive…
      </p>
    )
  }

  const inputBg = light ? "rgba(255,255,255,0.15)" : "#ffffff"
  const inputBorder = light ? "rgba(255,255,255,0.25)" : "#d8d2be"
  const inputColor = light ? "#ffffff" : "#111410"
  const inputPlaceholder = light ? "rgba(255,255,255,0.55)" : "#8a9080"

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-sm">
      <div className="flex items-center gap-2" style={{
        background: light ? "rgba(255,255,255,0.12)" : "#ffffff",
        border: `1px solid ${inputBorder}`,
        borderRadius: "9999px",
        padding: "4px 4px 4px 18px",
        boxShadow: light ? "none" : "0 1px 3px rgba(0,0,0,0.08)",
      }}>
        <input
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
          placeholder="your@creamery.com"
          className="flex-1 bg-transparent border-none outline-none text-sm"
          style={{ color: inputColor }}
        />
        <button
          type="submit"
          disabled={status === "loading"}
          className="inline-flex items-center gap-1.5 h-9 px-4 rounded-full text-sm font-semibold shrink-0 transition-all duration-150 disabled:opacity-60"
          style={{
            background: light ? "#ffffff" : "#1c4a2a",
            color: light ? "#1c4a2a" : "#ffffff",
          }}
        >
          {status === "loading" ? "…" : <>Subscribe <ArrowRight size={13} /></>}
        </button>
      </div>
      {status === "error" && (
        <p className="text-red-400 text-xs mt-2 pl-4">{message}</p>
      )}
    </form>
  )
}
