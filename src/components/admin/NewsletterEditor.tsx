"use client"

import { useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Save, Send, Eye, EyeOff, HelpCircle } from "lucide-react"

interface Newsletter {
  id: string
  title: string
  slug: string
  excerpt: string | null
  issue_number: number | null
  mdx_content: string
  published_at: string | null
  sent_at: string | null
}

const MDX_HELP = `## MDX Components

**Auto-populated market data:**
\`\`\`
<MarketSnapshot />
\`\`\`

**Sponsor placement:**
\`\`\`
<SponsorBlock position="header" />
<SponsorBlock position="body" />
<SponsorBlock position="footer" />
\`\`\`

**Standard markdown works too:**
# Heading 1
## Heading 2
**bold**, *italic*
> Blockquote
- Bullet list
1. Numbered list
---  (horizontal rule)`

const DEFAULT_CONTENT = `# From the Parlor

*A letter from the editor on what's happening in dairy this week.*

Your editorial content here — tell the story of what's happening on dairies right now. What pressures are producers facing? What market moves matter?

---

<MarketSnapshot />

---

## Operations Watch

What's happening in the parlor, the feedlot, and the fields this week.

<SponsorBlock position="body" />

## What This Means for Dairy Industry Professionals

Translate the farm-side news into actionable context for dairy industry professionals — creameries, co-ops, lenders, equipment dealers, and advisors.

---

*DairyCFO is published weekly. Forward this to a colleague who works with dairy producers.*
`

interface Props {
  newsletter?: Newsletter
}

export function NewsletterEditor({ newsletter }: Props) {
  const isNew = !newsletter
  const [title, setTitle] = useState(newsletter?.title ?? "")
  const [slug, setSlug] = useState(newsletter?.slug ?? "")
  const [excerpt, setExcerpt] = useState(newsletter?.excerpt ?? "")
  const [issueNumber, setIssueNumber] = useState(newsletter?.issue_number?.toString() ?? "")
  const [content, setContent] = useState(newsletter?.mdx_content ?? DEFAULT_CONTENT)
  const [showHelp, setShowHelp] = useState(false)
  const [saving, setSaving] = useState(false)
  const [publishing, setPublishing] = useState(false)
  const [sending, setSending] = useState(false)
  const [message, setMessage] = useState("")
  const router = useRouter()

  function autoSlug(t: string) {
    return t
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "")
  }

  function handleTitleChange(val: string) {
    setTitle(val)
    if (isNew && !slug) setSlug(autoSlug(val))
  }

  const save = useCallback(
    async (opts: { publish?: boolean; send?: boolean } = {}) => {
      if (opts.publish) setPublishing(true)
      else if (opts.send) setSending(true)
      else setSaving(true)

      setMessage("")

      const payload = {
        title,
        slug,
        excerpt: excerpt || null,
        issue_number: issueNumber ? parseInt(issueNumber) : null,
        mdx_content: content,
        publish: opts.publish,
        send: opts.send,
        id: newsletter?.id,
      }

      try {
        const res = await fetch(
          isNew ? "/api/admin/newsletters" : `/api/admin/newsletters/${newsletter.id}`,
          {
            method: isNew ? "POST" : "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          }
        )

        const data = await res.json()

        if (!res.ok) {
          setMessage("Error: " + (data.error ?? "Save failed"))
        } else {
          if (isNew && data.id) {
            router.push(`/admin/newsletters/${data.id}`)
            return
          }
          setMessage(
            opts.send
              ? `✓ Sent to subscribers!`
              : opts.publish
              ? "✓ Published"
              : "✓ Draft saved"
          )
        }
      } catch {
        setMessage("Network error — check connection")
      } finally {
        setSaving(false)
        setPublishing(false)
        setSending(false)
      }
    },
    [title, slug, excerpt, issueNumber, content, isNew, newsletter, router]
  )

  const isPublished = !!newsletter?.published_at
  const isSent = !!newsletter?.sent_at

  async function previewEmail() {
    if (!newsletter?.id) return
    const res = await fetch(`/api/admin/newsletters/${newsletter.id}/preview`)
    if (!res.ok) return
    const html = await res.text()
    const win = window.open("", "_blank")
    if (win) {
      win.document.write(html)
      win.document.close()
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      {/* Meta fields */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="md:col-span-2">
          <label className="block text-xs font-semibold text-[#2d2a1e] uppercase tracking-wider mb-1">
            Title *
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => handleTitleChange(e.target.value)}
            placeholder="April 2026 — What Spring Means for Dairy Margins"
            className="w-full px-3 py-2 border border-[#d8d2be] rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#1c4a2a] bg-white"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-[#2d2a1e] uppercase tracking-wider mb-1">
            Slug (URL)
          </label>
          <input
            type="text"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            placeholder="april-2026-spring-dairy-margins"
            className="w-full px-3 py-2 border border-[#d8d2be] rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#1c4a2a] bg-white font-mono"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-[#2d2a1e] uppercase tracking-wider mb-1">
            Issue #
          </label>
          <input
            type="number"
            value={issueNumber}
            onChange={(e) => setIssueNumber(e.target.value)}
            placeholder="1"
            className="w-full px-3 py-2 border border-[#d8d2be] rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#1c4a2a] bg-white"
          />
        </div>
      </div>

      <div className="mb-6">
        <label className="block text-xs font-semibold text-[#2d2a1e] uppercase tracking-wider mb-1">
          Excerpt (preview text for archive listing)
        </label>
        <input
          type="text"
          value={excerpt}
          onChange={(e) => setExcerpt(e.target.value)}
          placeholder="Class III prices hold steady as spring flush begins in the Upper Midwest..."
          className="w-full px-3 py-2 border border-[#d8d2be] rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#1c4a2a] bg-white"
        />
      </div>

      {/* Editor */}
      <div className="bg-white border border-[#d8d2be] rounded-lg overflow-hidden mb-6">
        <div className="flex items-center justify-between px-4 py-3 border-b border-[#d8d2be] bg-[#f7f4ed]">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-[#2d2a1e] uppercase tracking-wider">
              MDX Content
            </span>
            <button
              onClick={() => setShowHelp(!showHelp)}
              className="text-[#8a8068] hover:text-[#1c4a2a] transition-colors"
              title="MDX Component Reference"
            >
              <HelpCircle size={14} />
            </button>
          </div>
          <span className="text-xs text-[#8a8068]">
            {content.length.toLocaleString()} chars
          </span>
        </div>

        {showHelp && (
          <div className="bg-[#1c2e1f] text-[#c8e6c0] p-4 text-xs font-mono border-b border-[#d8d2be] whitespace-pre-wrap leading-relaxed">
            {MDX_HELP}
          </div>
        )}

        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="w-full p-5 text-sm font-mono leading-relaxed focus:outline-none resize-none"
          style={{ minHeight: "520px" }}
          placeholder="Write your newsletter content in MDX..."
          spellCheck
        />
      </div>

      {/* Actions */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => save()}
            disabled={saving || !title || !slug}
            className="inline-flex items-center gap-2 bg-[#f7f4ed] border border-[#d8d2be] text-[#1c2e1f] px-4 py-2 rounded-md text-sm font-medium hover:bg-[#ede8d8] transition-colors disabled:opacity-50"
          >
            <Save size={14} />
            {saving ? "Saving..." : "Save Draft"}
          </button>

          {!isPublished && (
            <button
              onClick={() => save({ publish: true })}
              disabled={publishing || !title || !slug}
              className="inline-flex items-center gap-2 bg-[#1c4a2a] text-[#f7f4ed] px-4 py-2 rounded-md text-sm font-medium hover:bg-[#163d22] transition-colors disabled:opacity-50"
            >
              <Eye size={14} />
              {publishing ? "Publishing..." : "Publish to Archive"}
            </button>
          )}

          {isPublished && !isSent && (
            <button
              onClick={() => {
                if (confirm("Send this issue to all active subscribers? This cannot be undone.")) {
                  save({ send: true })
                }
              }}
              disabled={sending}
              className="inline-flex items-center gap-2 bg-[#c8902a] text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-[#b07820] transition-colors disabled:opacity-50"
            >
              <Send size={14} />
              {sending ? "Sending..." : "Send to Subscribers"}
            </button>
          )}

          {isSent && (
            <span className="inline-flex items-center gap-2 text-sm text-green-600 font-medium">
              ✓ Sent {newsletter?.sent_at ? new Date(newsletter.sent_at).toLocaleDateString() : ""}
            </span>
          )}
        </div>

        <div className="flex items-center gap-3">
          {newsletter?.id && (
            <button
              onClick={previewEmail}
              className="inline-flex items-center gap-1 text-sm text-[#1c4a2a] hover:underline"
              title="Preview rendered email HTML"
            >
              <Eye size={14} />
              Preview Email
            </button>
          )}
          {newsletter?.slug && (
            <a
              href={`/newsletters/${newsletter.slug}`}
              target="_blank"
              className="inline-flex items-center gap-1 text-sm text-[#1c4a2a] hover:underline"
            >
              <EyeOff size={14} />
              Preview Web
            </a>
          )}
          {message && (
            <span
              className={`text-sm font-medium ${
                message.startsWith("Error") ? "text-red-500" : "text-[#1c4a2a]"
              }`}
            >
              {message}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
