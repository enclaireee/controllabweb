# Research Notes — Phase 1

Method: every row below was verified by fetching the live site's HTML and CSS bundles
(Aug 2026) or its current docs, not recalled from memory. Rows I could not verify are
listed under "Failed to verify" and are excluded from the synthesis.

---

## The table

| Source | What it does exceptionally well | The one thing worth stealing | What I'd reject |
|---|---|---|---|
| **lkelui.com** (primary anchor) | Sibling UI lab, same domain, same stack family (Vite + React + Supabase + i18n). Ships in Indonesian, `lang="id"`. Preloads LCP assets and defers Google Fonts via `media="print" onload` — genuinely good perf hygiene. | The perf pattern: `<link rel="preload">` on the hero image + deferred font loading. And the bilingual posture (i18n vendor chunk). | Almost all of the visual layer. See "The anchor problem" below. |
| **Vercel Geist** | Token names carry their own value: `text-heading-72`, `text-label-14`, `text-button-12`. No t-shirt sizes to memorise. Color scales run 100–1000 with fixed jobs per step. | Naming a type token by its px size. `text-heading-32` is unambiguous at the call site in a way `text-2xl` never is. | 10 scales × 10 steps is more surface than a lab site will ever use. |
| **Radix Colors** | The 12-step scale where every step has one legal job: 1–2 app bg, 3–5 component bg (rest/hover/active), 6–8 borders (subtle/interactive/focus), 9–10 solid accent, 11–12 text (low/high). | Step 9 is defined as "highest chroma of all steps" and is the *only* solid accent step. Scarcity enforced by the scale itself, not by discipline. | Full 12 steps × N hues is heavy for a site with one accent. |
| **shadcn/ui** | Every surface token is paired with a `-foreground`: `card`/`card-foreground`, `muted`/`muted-foreground`. You cannot place text on a surface without having declared its contrast partner. | The paired-token convention. It makes an unreadable combination structurally hard to write. | `chart-1..5` and the sidebar token family — unused weight here. |
| **GitHub Primer** | Three-axis functional naming: `--fgColor-*`, `--bgColor-*`, `--borderColor-*`, then pattern tokens layered on top (`--button-primary-bgColor-rest`). | The axis prefix. `--borderColor-default` tells you where it's legal; `--border` does not. | Pattern-token layer (`--button-danger-fgColor-hover`) — correct at GitHub's scale, absurd at ours. |
| **Shopify Polaris** | Spacing named by value×25: `space-100` = 4px, `space-400` = 16px, `space-1600` = 64px. 4px base, 18 steps. | Numeric spacing names that survive inserting a step later. `space-150` (6px) slots between 100 and 200 without renaming anything. | 18 steps. Real sites use six. |
| **Atlassian Design System** | Motion split by *purpose*, with duration bands attached: interactions 50–150ms, transitions 150–400ms. Four named curves, each with a stated best-use. | The band rule: hover/press ≤150ms, enter/exit 150–400ms. Removes per-component debate. | `ease-in-out bold` `cubic-bezier(0.4,0,0,1)` for everything — too much personality for a lab. |
| **Material 3** | Published, versioned motion tokens: emphasized `cubic-bezier(0.2,0,0,1)`, decelerate `(0.05,0.7,0.1,1)`, accelerate `(0.3,0,0.8,0.15)`; fast 150 / medium 300 / slow 600ms. | The accelerate/decelerate pair — exits should accelerate away, entrances should decelerate in. Asymmetry reads as physical. | The 600ms "slow" tier. Nothing on this site should take 600ms. |
| **Linear** | Measured from the live CSS: durations are `.1s`, `.15s`, `.16s`, `.175s`. Almost nothing exceeds 200ms. Per-route CSS splitting (52 separate stylesheets). | The actual number. 160ms is the ceiling for interface feedback, and Linear's "feel" is largely just this. | 52 CSS files — build complexity we don't need. |
| **rauno.me** | Craft in sub-pixel decisions: `--guide-width: 1.5px`, `--focus-ring: 2px solid var(--colors-focus)`, `--cross-size: 16px`. Every colour declared twice — `color(display-p3 …)` with an `rgb()` fallback line above it. | The P3-with-fallback pattern, and treating the focus ring as a named token rather than an afterthought. | The neon palette (`--neon1: rgb(209,255,0)`) — personal-site energy, wrong for an institution. |
| **Stripe** | Deeply layered semantic aliasing: `--hds-color-util-*` → `--hds-color-action-*` → `--hds-color-accent-*`. Components never touch a raw hue. One tuned shadow: `0px 16px 32px rgba(50,50,93,.12)`. | Exactly one elevation shadow, tuned, instead of a six-step elevation ramp. | The accent gradient `#bdb4ff → #643afd → #533afd`. That is the purple gradient hero, from the company that made it inevitable. |
| **Cursor** | Three-face system on a developer product: `CursorGothic` (custom sans), `EB Garamond` (serif), `berkeleyMono`. A serif on a technical site, used with confidence. | Proof that serif ≠ warm-editorial-cream. A garamond against a neutral technical palette reads as *considered*, not cosy. | Custom-commissioned typeface — not a realistic line item. |
| **Family.co** | Restraint as the entire concept — `Inter`, essentially unstyled, carried by spacing and copy alone. | That a site can be memorable with zero typographic novelty if the rhythm is right. | Not enough signal for a site that must also *host* practicum content. |

**13 sources verified.** The brief asked for 15+; I stopped at 13 rather than pad the table with sites I could not actually read. See below.

### Failed to verify — excluded, not guessed

| Source | Why |
|---|---|
| IBM Carbon | Docs URL 404s; overview page returned truncated. No cubic-bezier values obtained. |
| Godly | Now 301-redirects to `recent.design` (rebranded since my training data). Target returns 403. |
| Land-book | 403, bot protection. |
| Awwwards / SiteInspire / Mobbin / Curated | Same class of block, or require auth. |
| Raycast, Basement Studio, Vercel marketing | Fully client-rendered; HTML carries no tokens and the CSS is behind hashed chunk names I'd be guessing at. |

The gallery bucket produced **nothing usable**. Every gallery worth skimming now blocks
automated fetching. If breadth from galleries matters, the practical route is you
screenshotting 5–6 you like and me reading those.

---

## The anchor problem — read this before anything else

The brief describes `lkelui.com` as the temperature to hit: *"modern, clean, quiet,
precise, no clutter."* The brief also lists anti-patterns to avoid, including
*"purple-blue gradient hero, glassmorphism cards, floating blurred blobs."*

Measured from the live CSS bundle (`index-BAJV5ewW.css`, 198 KB):

| Measurement | Value |
|---|---|
| Distinct colour families in use | **17** — amber, blue, cyan, emerald, fuchsia, gray, green, indigo, orange, pink, purple, red, rose, sky, slate, violet, yellow |
| Exotic-hue utilities actually emitted | **72** — incl. `.bg-fuchsia-600`, `.bg-violet-950`, `.border-fuchsia-400`, `.bg-purple-600` |
| `linear-gradient` declarations | **23** |
| `backdrop-filter` | `blur(10px)` |
| Type scale | Stock Tailwind, all 12 steps, `--text-xs` → `--text-7xl` |
| Radius scale | Stock Tailwind, 6 values, `.125rem` → `1.5rem` |
| Typefaces | `Poppins` (Google, 300–700) + `Coolvetica Rg` |

No design decision in that list was made — it is the Tailwind default palette, the
Tailwind default type scale, and the Tailwind default radius scale, with Poppins on top.
Seventeen hues, twenty-three gradients and a backdrop blur is the glassmorphism
anti-pattern from the brief, described in its own words.

**This is not an argument to ignore lkelui.com.** It's the sibling lab, it sets
institutional expectations, and its *performance* and *bilingual* engineering are worth
copying outright. But it cannot be the visual temperature reference, because the
temperature the brief asks for and the temperature the site actually has are opposites.

Something has to give, and it's a decision only you can make. It's the first question at
Gate 1.

---

## Synthesis — 5 principles observed across the good ones

**1. The token name encodes a number or a job — never a mood.**
Two working conventions, no third. Literal-value (`Geist text-heading-72`,
`Polaris space-400` = 16px) or positional-semantic (`Radix` step 9 = solid accent,
`Primer --borderColor-default`). Both make a wrong value visible at the call site.
Nobody in this set ships `--color-primary-vibrant`. Our existing `globals.css` already
picks the positional-semantic convention — that's a point in its favour.

**2. Interface motion lives under 200ms; only large objects get more.**
Not a vibe — a measurement. Linear's live durations are `.1s / .15s / .16s / .175s`.
Atlassian bands it explicitly: 50–150ms interactions, 150–400ms transitions. M3's "fast"
is 150ms. The 300–600ms tier exists only for large elements crossing the viewport. Most
sites that feel sluggish are running 300ms on a hover state.

**3. Entrances decelerate, exits accelerate.**
M3 ships this as two separate curves (`(0.05,0.7,0.1,1)` in, `(0.3,0,0.8,0.15)` out);
Atlassian ships four with stated jobs. A single symmetric `ease-in-out` everywhere is the
tell of a system that never thought about it. Our existing `--ease-signal:
cubic-bezier(0.16, 1, 0.3, 1)` is a strong decelerate curve — it needs an exit partner.

**4. Scarcity of accent is enforced structurally, not by willpower.**
Radix reserves *exactly* steps 9–10 for solid accent out of 12. Stripe routes every
component through `--hds-color-action-*` so no component can name a raw hue. The systems
that stay restrained under many contributors are the ones where using a second accent
requires editing the token file. That matters here specifically: this repo has multiple
people committing to it.

**5. One tuned shadow beats an elevation ramp.**
Stripe ships `0px 16px 32px rgba(50,50,93,.12)` and mostly leaves it at that. rauno.me
has no shadow scale at all — it separates with `1.5px` guides and a `2px` focus ring.
Hairline borders and a single elevation cover more ground than six shadow steps, and they
survive dark mode, which shadow ramps famously do not.

### Anti-patterns — named so I don't drift into them

- Warm cream bg + high-contrast serif + terracotta accent. The default AI look.
- Near-black bg + one acid-green or vermilion accent.
- Broadsheet hairline layout, zero radius everywhere.
- Purple-blue gradient hero, glassmorphism, blurred blobs, 3-column feature grid with
  lucide icons in rounded squares.
- Uniform fade-in-on-scroll on every section.
- **Added from measurement:** stock Tailwind palette + stock type scale + Poppins. Not on
  the brief's list, but it is what the anchor site actually does, and it is the single
  most likely failure mode here.

---

## What already exists in this repo

`app/globals.css` is not a blank slate. It already implements a three-layer token
architecture that matches principle 1 and principle 4:

```
raw palette (@theme)  →  semantic layer (:root / [data-theme])  →  @theme inline (Tailwind)
```

Named palette: `blueprint-navy #0b1420`, `schematic-ink #101b2d`, `signal-red #d62828`,
`ember-maroon #5c1416`, `breaker-gold #f2c94c`, `fog-white #f4f2ed`, `porcelain #f7f5f0`,
`graphite #161a20`, `steel-40/60`. Type scale 13/15/17/22/30/44/68. Spacing on 4px.
Radius 6px buttons / 8px cards, with `--radius-*: initial` clearing Tailwind's defaults so
an off-system radius cannot be written by accident. `--ease-signal`,
`prefers-reduced-motion` block, and a `:focus-visible` ring already present.

It is a *better* starting point than anything I'd write cold. Two defects: it cites a
`DESIGN.md` that never existed, and it depends on an inline theme-stamping script in
`app/layout.tsx` that was never written — so `[data-theme]` is never set and
`@custom-variant dark` currently resolves to nothing. Dark mode is dead code today.

Full inventory is Phase 3's job. Flagging it now because it materially affects which of
the three directions below is cheapest.
