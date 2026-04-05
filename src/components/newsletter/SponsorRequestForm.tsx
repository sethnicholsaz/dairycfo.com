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

  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "10px 14px",
    border: "1px solid #d8d2be",
    borderRadius: "10px",
    fontSize: "14px",
    color: "#111410",
    background: "#fdfcf9",
    outline: "none",
    transition: "border-color 0.15s",
  }

  const labelStyle: React.CSSProperties = {
    display: "block",
    fontSize: "12px",
    fontWeight: 600,
    color: "#4a5046",
    textTransform: "uppercase",
    letterSpacing: "0.05em",
    marginBottom: "6px",
  }

  if (status === "success") {
    return (
      <div className="text-center py-10">
        <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: "#e8f5ec" }}>
          <span style={{ color: "#1c4a2a", fontSize: "20px" }}>✓</span>
        </div>
        <h3 className="font-semibold mb-2" style={{ color: "#111410", fontSize: "1.125rem" }}>Request received</h3>
        <p className="text-sm" style={{ color: "#4a5046" }}>We&apos;ll confirm availability and send a payment link within 1 business day.</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label style={labelStyle}>Company *</label>
          <input type="text" name="company" required value={form.company} onChange={handleChange}
            style={inputStyle} placeholder="Acme Dairy Supply"
            onFocus={e => (e.currentTarget.style.borderColor = "#1c4a2a")}
            onBlur={e => (e.currentTarget.style.borderColor = "#d8d2be")} />
        </div>
        <div>
          <label style={labelStyle}>Your name</label>
          <input type="text" name="contact_name" value={form.contact_name} onChange={handleChange}
            style={inputStyle} placeholder="Jane Smith"
            onFocus={e => (e.currentTarget.style.borderColor = "#1c4a2a")}
            onBlur={e => (e.currentTarget.style.borderColor = "#d8d2be")} />
        </div>
      </div>

      <div>
        <label style={labelStyle}>Email *</label>
        <input type="email" name="contact_email" required value={form.contact_email} onChange={handleChange}
          style={inputStyle} placeholder="jane@company.com"
          onFocus={e => (e.currentTarget.style.borderColor = "#1c4a2a")}
          onBlur={e => (e.currentTarget.style.borderColor = "#d8d2be")} />
      </div>

      <div>
        <label style={labelStyle}>Website</label>
        <input type="url" name="website" value={form.website} onChange={handleChange}
          style={inputStyle} placeholder="https://yourcompany.com"
          onFocus={e => (e.currentTarget.style.borderColor = "#1c4a2a")}
          onBlur={e => (e.currentTarget.style.borderColor = "#d8d2be")} />
      </div>

      <div>
        <label style={labelStyle}>Desired issue / timing</label>
        <input type="text" name="desired_newsletter" value={form.desired_newsletter} onChange={handleChange}
          style={inputStyle} placeholder="Next available, May 2026, etc."
          onFocus={e => (e.currentTarget.style.borderColor = "#1c4a2a")}
          onBlur={e => (e.currentTarget.style.borderColor = "#d8d2be")} />
      </div>

      <div>
        <label style={labelStyle}>Artwork upload</label>
        <label
          htmlFor="artwork-upload"
          className="flex flex-col items-center justify-center gap-2 cursor-pointer rounded-xl py-6"
          style={{ border: "2px dashed #d8d2be", background: "#fdfcf9", transition: "border-color 0.15s" }}
          onMouseEnter={e => (e.currentTarget.style.borderColor = "#1c4a2a")}
          onMouseLeave={e => (e.currentTarget.style.borderColor = "#d8d2be")}
        >
          <input type="file" id="artwork-upload" accept="image/*" className="hidden"
            onChange={e => setArtwork(e.target.files?.[0] ?? null)} />
          <Upload size={18} style={{ color: "#8a9080" }} />
          {artwork ? (
            <span className="text-sm font-medium" style={{ color: "#1c4a2a" }}>{artwork.name}</span>
          ) : (
            <span className="text-sm" style={{ color: "#8a9080" }}>PNG, JPEG or WebP · 1200×300 recommended</span>
          )}
        </label>
        <p className="text-xs mt-1.5" style={{ color: "#8a9080" }}>You can send artwork later — we&apos;ll follow up by email.</p>
      </div>

      <div>
        <label style={labelStyle}>Additional notes</label>
        <textarea name="message" value={form.message} onChange={handleChange} rows={3}
          style={{ ...inputStyle, resize: "none" }}
          placeholder="Anything else about your sponsorship goals?"
          onFocus={e => (e.currentTarget.style.borderColor = "#1c4a2a")}
          onBlur={e => (e.currentTarget.style.borderColor = "#d8d2be")} />
      </div>

      {errorMsg && <p className="text-red-500 text-sm">{errorMsg}</p>}

      <button
        type="submit"
        disabled={status === "loading"}
        className="w-full h-11 rounded-full text-sm font-semibold transition-all duration-150 disabled:opacity-60"
        style={{ background: "#1c4a2a", color: "#ffffff" }}
        onMouseEnter={e => (e.currentTarget.style.background = "#245c33")}
        onMouseLeave={e => (e.currentTarget.style.background = "#1c4a2a")}
      >
        {status === "loading" ? "Submitting…" : "Submit sponsorship request"}
      </button>
      <p className="text-xs text-center" style={{ color: "#8a9080" }}>
        Payment collected via Stripe after we confirm availability.
      </p>
    </form>
  )
}
