"use client"

import { useState } from "react"

interface Sponsor {
  id: string
  company: string
}

interface Newsletter {
  id: string
  title: string
  issue_number: number | null
}

interface Props {
  sponsor: Sponsor
  newsletters: Newsletter[]
}

export function SponsorAdminActions({ sponsor, newsletters }: Props) {
  const [newsletterId, setNewsletterId] = useState("")
  const [position, setPosition] = useState("body")
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState("")

  async function assign() {
    if (!newsletterId) return
    setSaving(true)
    setMsg("")

    const res = await fetch("/api/admin/sponsor-placements", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sponsor_id: sponsor.id, newsletter_id: newsletterId, position }),
    })

    const data = await res.json()
    setSaving(false)
    setMsg(res.ok ? "✓ Assigned to newsletter" : "Error: " + data.error)
  }

  return (
    <div className="mt-3 flex items-center gap-3 flex-wrap">
      <span className="text-xs text-[#6b6348] font-medium">Assign to issue:</span>
      <select
        value={newsletterId}
        onChange={(e) => setNewsletterId(e.target.value)}
        className="px-2 py-1 border border-[#d8d2be] rounded text-xs bg-white focus:outline-none"
      >
        <option value="">Select issue...</option>
        {newsletters.map((n) => (
          <option key={n.id} value={n.id}>
            {n.issue_number ? `#${n.issue_number} — ` : ""}{n.title}
          </option>
        ))}
      </select>
      <select
        value={position}
        onChange={(e) => setPosition(e.target.value)}
        className="px-2 py-1 border border-[#d8d2be] rounded text-xs bg-white focus:outline-none"
      >
        <option value="header">Header</option>
        <option value="body">Body</option>
        <option value="footer">Footer</option>
      </select>
      <button
        onClick={assign}
        disabled={saving || !newsletterId}
        className="bg-[#1c4a2a] text-[#f7f4ed] px-3 py-1 rounded text-xs font-medium hover:bg-[#163d22] transition-colors disabled:opacity-50"
      >
        {saving ? "Saving..." : "Assign"}
      </button>
      {msg && (
        <span className={`text-xs font-medium ${msg.startsWith("Error") ? "text-red-500" : "text-[#1c4a2a]"}`}>
          {msg}
        </span>
      )}
    </div>
  )
}
