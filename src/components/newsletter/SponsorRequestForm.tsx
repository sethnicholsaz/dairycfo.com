"use client"

import { useState } from "react"
import { Upload } from "lucide-react"

export function SponsorRequestForm() {
  const [form, setForm] = useState({
    company: "",
    contact_name: "",
    contact_email: "",
    website: "",
    desired_newsletter: "",
    message: "",
  })
  const [artwork, setArtwork] = useState<File | null>(null)
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle")
  const [errorMsg, setErrorMsg] = useState("")

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setStatus("loading")
    setErrorMsg("")
    const fd = new FormData()
    Object.entries(form).forEach(([k, v]) => fd.append(k, v))
    if (artwork) fd.append("artwork", artwork)
    try {
      const res = await fetch("/api/sponsors", { method: "POST", body: fd })
      const data = await res.json()
      if (!res.ok) { setStatus("error"); setErrorMsg(data.error ?? "Something went wrong."); return }
      if (data.checkoutUrl) { window.location.href = data.checkoutUrl } else { setStatus("success") }
    } catch {
      setStatus("error"); setErrorMsg("Network error. Please try again.")
    }
  }

  const inputClass = "w-full px-3.5 py-2.5 border border-cream-400 rounded-[10px] text-sm text-ink-900 bg-cream-100 outline-none transition-colors focus:border-green-800"
  const labelClass = "block text-xs font-semibold text-ink-500 uppercase tracking-[0.05em] mb-1.5"

  if (status === "success") {
    return (
      <div className="text-center py-10">
        <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 bg-green-100">
          <span className="text-green-800 text-xl">✓</span>
        </div>
        <h3 className="font-semibold mb-2 text-ink-900 text-[1.125rem]">Request received</h3>
        <p className="text-sm text-ink-500">We&apos;ll confirm availability and send a payment link within 1 business day.</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>Company *</label>
          <input type="text" name="company" required value={form.company} onChange={handleChange}
            className={inputClass} placeholder="Acme Dairy Supply" />
        </div>
        <div>
          <label className={labelClass}>Your name</label>
          <input type="text" name="contact_name" value={form.contact_name} onChange={handleChange}
            className={inputClass} placeholder="Jane Smith" />
        </div>
      </div>

      <div>
        <label className={labelClass}>Email *</label>
        <input type="email" name="contact_email" required value={form.contact_email} onChange={handleChange}
          className={inputClass} placeholder="jane@company.com" />
      </div>

      <div>
        <label className={labelClass}>Website</label>
        <input type="url" name="website" value={form.website} onChange={handleChange}
          className={inputClass} placeholder="https://yourcompany.com" />
      </div>

      <div>
        <label className={labelClass}>Desired issue / timing</label>
        <input type="text" name="desired_newsletter" value={form.desired_newsletter} onChange={handleChange}
          className={inputClass} placeholder="Next available, May 2026, etc." />
      </div>

      <div>
        <label className={labelClass}>Artwork upload</label>
        <label
          htmlFor="artwork-upload"
          className="flex flex-col items-center justify-center gap-2 cursor-pointer rounded-xl py-6 border-2 border-dashed border-cream-400 bg-cream-100 transition-colors hover:border-green-800"
        >
          <input type="file" id="artwork-upload" accept="image/*" className="hidden"
            onChange={e => setArtwork(e.target.files?.[0] ?? null)} />
          <Upload size={18} className="text-ink-300" />
          {artwork ? (
            <span className="text-sm font-medium text-green-800">{artwork.name}</span>
          ) : (
            <span className="text-sm text-ink-300">PNG, JPEG or WebP · 1200×300 recommended</span>
          )}
        </label>
        <p className="text-xs mt-1.5 text-ink-300">You can send artwork later — we&apos;ll follow up by email.</p>
      </div>

      <div>
        <label className={labelClass}>Additional notes</label>
        <textarea name="message" value={form.message} onChange={handleChange} rows={3}
          className={`${inputClass} resize-none`}
          placeholder="Anything else about your sponsorship goals?" />
      </div>

      {errorMsg && <p className="text-error text-sm">{errorMsg}</p>}

      <button
        type="submit"
        disabled={status === "loading"}
        className="w-full h-11 rounded-full text-sm font-semibold transition-colors duration-150 disabled:opacity-60 bg-green-800 text-white hover:bg-green-700"
      >
        {status === "loading" ? "Submitting…" : "Submit sponsorship request"}
      </button>
      <p className="text-xs text-center text-ink-300">
        Payment collected via Stripe after we confirm availability.
      </p>
    </form>
  )
}
