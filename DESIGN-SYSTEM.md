# DairyCFO Design System

> Reference for brand colors, typography, spacing, components, and patterns. All tokens are defined as CSS custom properties in `src/app/globals.css` and exposed as Tailwind utilities via `@theme inline`.

---

## Color Palette

### Brand Greens
| Token | Tailwind Class | Hex | Usage |
|---|---|---|---|
| `--green-900` | `bg-green-900` / `text-green-900` | `#0f2a18` | Darkest green; editor code panel backgrounds |
| `--green-800` | `bg-green-800` / `text-green-800` | `#1c4a2a` | Primary brand green; buttons, headers, links |
| `--green-700` | `bg-green-700` / `text-green-700` | `#245c33` | Hover state for green-800 buttons |
| `--green-600` | `bg-green-600` / `text-green-600` | `#2d7040` | Accent green |
| `--green-100` | `bg-green-100` / `text-green-100` | `#e8f5ec` | Light green tint; success icon backgrounds |
| `--green-50`  | `bg-green-50`                     | `#f4faf6` | Subtle green wash |

### Gold Accents
| Token | Tailwind Class | Hex | Usage |
|---|---|---|---|
| `--gold-600` | `bg-gold-600` / `text-gold-600` | `#c8902a` | CTA highlight; "Send to Subscribers" action |
| `--gold-500` | `bg-gold-500` / `text-gold-500` | `#d4a040` | Lighter gold accent |
| `--gold-100` | `bg-gold-100`                   | `#fdf3e0` | Gold wash background |

### Cream / Off-white
| Token | Tailwind Class | Hex | Usage |
|---|---|---|---|
| `--cream-100` | `bg-cream-100` | `#fdfcf9` | Page background, input backgrounds |
| `--cream-200` | `bg-cream-200` | `#f7f4ed` | Card backgrounds, editor toolbar, secondary buttons |
| `--cream-300` | `bg-cream-300` | `#ede8d8` | Hover state for cream-200 elements |
| `--cream-400` | `border-cream-400` | `#d8d2be` | Borders, dividers, input borders |

### Ink (Text)
| Token | Tailwind Class | Hex | Usage |
|---|---|---|---|
| `--ink-900` | `text-ink-900` | `#111410` | Primary body text, headings |
| `--ink-700` | `text-ink-700` | `#2a2e26` | Secondary headings, label text |
| `--ink-500` | `text-ink-500` | `#4a5046` | Body copy, descriptions |
| `--ink-300` | `text-ink-300` | `#8a9080` | Muted text, placeholders, captions |
| `--ink-100` | `text-ink-100` | `#c8cec0` | Disabled / very muted |

### Status Tokens
| Token | Tailwind Class | Hex | Usage |
|---|---|---|---|
| `--error`   | `text-error` / `bg-error`   | `#b91c1c` | Error messages, validation |
| `--success` | `text-success` / `bg-success` | (green-700) | Success states |

---

## Typography

### Fonts
- **Sans** (`font-sans`): Geist Sans — body text, UI elements
- **Serif** (`font-serif`): Georgia / Times New Roman — headlines, brand names, editorial headers
- **Mono** (`font-mono`): Geist Mono — code, slugs, **price / numerical data**

### Usage Rules
- Use `font-serif` for page `h1` headings, newsletter titles, and the "Dairy Market Snapshot" header.
- Use `font-mono` for all numeric price data (Class III, futures, currency values). This ensures digit alignment and signals "data" to the reader.
- Use `font-sans` for everything else.

### Scale (Common)
| Class | Size | Usage |
|---|---|---|
| `text-xs` | 12px | Labels, captions, metadata |
| `text-sm` | 14px | Body copy, form fields |
| `text-base` | 16px | Default |
| `text-lg` | 18px | Subheadings, price values in market snapshot |
| `text-[1.125rem]` | 18px | Hero descriptions |
| `text-[2.5rem]` | 40px | Pricing tier prices (font-serif) |

---

## Spacing & Layout

- Page max-width: `max-w-7xl mx-auto px-6`
- Section vertical rhythm: `pt-[120px] pb-[72px]` (hero), `pb-[96px]` (content sections)
- Card padding: `p-8` (tier cards), `p-6` (standard cards)
- Form field gap: `space-y-5`

---

## Components

### Buttons

All pill-shaped CTAs use `rounded-full`. Standard actions use `rounded-md`.

| Variant | Classes | Usage |
|---|---|---|
| Green (primary) | `bg-green-800 text-white hover:bg-green-700 transition-colors` | Primary CTA, subscribe, publish |
| Gold | `bg-gold-600 text-white hover:opacity-90 transition-opacity` | Highlighted action (send newsletter, premium CTA on dark card) |
| Outline dark | `bg-transparent text-ink-900 border border-cream-400` | Secondary CTA on light backgrounds |
| Cream (secondary) | `bg-cream-200 border border-cream-400 text-green-900 hover:bg-cream-300` | Save Draft, admin secondary actions |

### Inputs & Forms

```tsx
// Standard input
className="w-full px-3.5 py-2.5 border border-cream-400 rounded-[10px] text-sm text-ink-900 bg-cream-100 outline-none transition-colors focus:border-green-800"

// Standard label
className="block text-xs font-semibold text-ink-500 uppercase tracking-[0.05em] mb-1.5"

// Admin/editor input (smaller rounding)
className="w-full px-3 py-2 border border-cream-400 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-green-800 bg-white"
```

### Cards

```tsx
// Standard card
className="bg-white border border-cream-400 rounded-2xl p-8"

// Highlighted card (pricing)
className="bg-green-800 rounded-2xl p-8"  // shadow: "0 8px 40px rgba(28,74,42,0.25)"

// Flat info card
className="bg-cream-200 border border-cream-400 rounded-2xl px-8 py-10"
```

### Hover Utilities (CSS classes in globals.css)

| Class | Effect |
|---|---|
| `card-hover` | Border → green-800, soft box shadow on hover |
| `link-hover` | Color → ink-900 on hover |
| `link-green-hover` | Color → green-800 on hover |

---

## Market Snapshot Component

- Header background: `bg-green-800 text-cream-200`
- Price values: `font-mono font-bold text-green-800 text-lg`
- Futures strip values: `font-mono font-semibold text-green-800`
- Label text: `text-ink-500`
- Muted/caption text: `text-ink-300`
- Section backgrounds: `bg-cream-200` (body), `bg-cream-300` (footer strip)
- Card borders: `border-cream-400`

---

## Newsletter Prose

Newsletter body content rendered as HTML uses the `.newsletter-prose` class (defined in `globals.css`):

- `h1`, `h2` — `font-serif`, `text-green-800`
- `p` — `text-ink-700`, `line-height: 1.75`
- `blockquote` — left border `gold-600`, `text-ink-500`
- `a` — `text-green-800`, underline
- `hr` — `border-cream-400`

---

## File Locations

| Asset | Path |
|---|---|
| CSS tokens & globals | `src/app/globals.css` |
| Tailwind config | `tailwind.config.ts` (if present) or via `@theme inline` in globals.css |
| shadcn/ui Button | `src/components/ui/button.tsx` |
| UpgradeButton | `src/components/pricing/UpgradeButton.tsx` |
| SponsorRequestForm | `src/components/newsletter/SponsorRequestForm.tsx` |
| MarketSnapshot | `src/components/newsletter/MarketSnapshot.tsx` |
| NewsletterEditor | `src/components/admin/NewsletterEditor.tsx` |
| SiteNav | `src/components/layout/SiteNav.tsx` |
| SiteFooter | `src/components/layout/SiteFooter.tsx` |

---

## Brand Alignment

This design system is aligned with the CMO brand identity defined in [DAIA-16](/DAIA/issues/DAIA-16):

- **Primary brand color**: Deep forest green (`#1c4a2a` / `green-800`)
- **Accent**: Warm gold (`#c8902a` / `gold-600`)
- **Background**: Warm cream (`#fdfcf9` / `cream-100`)
- **Typographic voice**: Authoritative, data-forward, agricultural editorial
- **UI personality**: Clean, professional, trust-building — for dairy industry CFOs and advisors
