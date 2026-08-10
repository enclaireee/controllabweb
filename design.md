# design.md — Controllab

The contract. Read this before touching UI. Every value here is real and measured;
nothing is a placeholder. If you need a value that isn't here, **amend this file first** —
do not invent one at a call site.

Token source of truth: `app/globals.css`. This file explains *why* and *when*; that file
holds the *what*. They must not disagree.

---

## 1 — Subject & direction

**What it is.** The web platform for Laboratorium Sistem Kendali, Departemen Teknik
Elektro, Universitas Indonesia. Two halves sharing one chrome:

| Half | Owner | Contents |
|---|---|---|
| Public | teammates | Landing, About, Materi, Simulator |
| Praktikum system | us | Authenticated praktikan + asisten routes |
| Global chrome (header, footer) | us | Wraps both |

**Audience, in priority order.** Praktikan first — they open this weekly and are the only
users with a deadline. Asisten second — they grade in batches and their time is the
scarcest. Public visitors third, and they never see the praktikum system.

**The single job of the praktikum system:** *a praktikan always knows what they owe and by
when; an asisten can grade a whole kelompok without fighting the interface.* Anything that
does not serve one of those two sentences is decoration.

**Direction: Instrument.** Clinical-precise, dark-first, built on the Blueprint palette.
Memorable through execution, not ornament.

**Reference → job.** Each reference has exactly one job. Do not import anything else from it.

| Reference | Its one job here |
|---|---|
| `lkelui.com` | **Performance pattern only** — LCP preload, deferred font loading. Its visual layer is explicitly rejected (see §10). |
| Linear | Motion timing ceiling. Measured live: `.1s / .15s / .16s / .175s`. |
| Vercel Geist | Token-naming discipline — the name carries the value or the job. |
| Radix Colors | Accent scarcity. Step 9 is the *only* solid accent out of 12. |
| GitHub Primer | Semantic axis naming — fg / bg / border as separate axes. |
| Shopify Polaris | Spacing ladder shape — 4px base, named by value. |
| Atlassian | Motion duration bands — ≤150ms interactions, 150–400ms transitions. |
| Material 3 | Entrance/exit curve asymmetry. |
| rauno.me | Focus ring as a named token; sub-pixel discipline. |
| Stripe | One tuned elevation value, not a six-step ramp. |

---

## 2 — Color

Three hues total. Red, gold, green. That is the entire chromatic budget.

| Token | Dark | Light | Use |
|---|---|---|---|
| `--bg` | `#0b1420` | `#f7f5f0` | Page ground |
| `--surface` | `#101b2d` | `#ffffff` | Cards, panels, table surface |
| `--surface-raised` | `#1a2740` | `#ffffff` | Popovers, menus, hover rows |
| `--text` | `#f4f2ed` | `#161a20` | Headings, primary labels |
| `--text-body` | `#f4f2ed` @92% | `#161a20` | Running copy |
| `--text-muted` | `#8b93a1` | `#5b6472` | Meta, captions, column heads |
| `--accent` | `#d62828` | `#d62828` | CTA fills, focus rings, ≥24px text |
| `--accent-text` | `#e85d5d` | `#d62828` | Accent at body size |
| `--highlight` | `#f2c94c` | `#8f6a10` | Annotation, tags, emphasis |
| `--success` | `#3ecf8e` | `#0f7b52` | Sudah dinilai, lulus |
| `--warning` | `#f2c94c` | `#8f6a10` | Mendekati deadline |
| `--danger` | `#e85d5d` | `#d62828` | Terlambat, gagal, destructive |

**Red is both accent and danger.** Deliberate. In a grading system red already means *needs
attention*; interactivity is signalled by shape and position, never by being red. This is
what keeps the palette at three hues under multiple contributors.

### Measured ratios — all pass AA

| Pair | Dark | Light |
|---|---|---|
| `--text` on `--bg` | 16.54 | 16.03 |
| `--text-body` on `--bg` | 14.01 | 16.03 |
| `--text-muted` on `--bg` | 5.98 | 5.49 |
| `--text-muted` on `--surface` | 5.58 | 5.98 |
| `--accent-text` on `--bg` | 5.42 | 4.60 |
| `--success` on `--surface` | 8.65 | 5.28 |
| `--warning` on `--surface` | 10.88 | 4.96 |
| `--danger` on `--surface` | 6.22 | 5.01 |
| `--border-strong` on `--surface` | 3.40 | 5.98 |
| `--accent` focus ring on `--bg` | 3.69 | 4.60 |

### Three hard rules — measured, not stylistic

1. **`--accent` (`#d62828`) is 3.69 on navy.** Legal for fills, focus rings, and text
   **≥24px**. Illegal for body-size text on dark. Use `--accent-text` there.
2. **`--accent-deep` (`#5c1416`) is 1.38 on navy.** Fill only. Never text, at any size, ever.
3. **`--border` is 1.36 on surface** — decorative separators only. Form controls must use
   `--border-strong` (WCAG 1.4.11 requires 3:1 for interactive boundaries).

**Forbidden:** any hex not in `app/globals.css`. No gradients. No `backdrop-filter`. No
fourth hue. No opacity-based "muted" text — use `--text-muted`.

---

## 3 — Typography

| Role | Face | Weights | Tracking | Usage |
|---|---|---|---|---|
| Display | Neue Montreal | 500, 700 | −0.015em ≥44px | Headings, hero, page titles |
| Body | General Sans | 400, 500, 600 | 0 | All running copy, labels, buttons |
| Data | system mono | 400, 500 | 0 | Scores, NIM, timestamps, deadlines, IDs |
| Serif | Reckless | — | — | **UNUSED.** Trial-licensed, must not ship. No role. |

### Scale — 13/15/17/22/30/44/68, ratio ~1.32

| Token | Size | Line-height | Tracking | Use |
|---|---|---|---|---|
| `text-meta` | 13px | 1.4 | 0 | Tags, badges, column heads, timestamps |
| `text-sm` | 15px | 1.5 | 0 | Table cells, form labels, buttons, dense UI |
| `text-base` | 17px | 1.6 | 0 | Module prose, instructions |
| `text-lg` | 22px | 1.4 | 0 | Section leads, card titles |
| `text-xl` | 30px | 1.25 | 0 | Page titles |
| `text-2xl` | 44px | 1.1 | −0.015em | Section heads |
| `text-3xl` | 68px | 1.05 | −0.015em | Hero, desktop |
| `text-hero-sm` | 36px | 1.1 | −0.015em | Hero, mobile |

**Nothing outside this ladder.** `--text-*: initial` clears Tailwind's defaults so an
off-scale size is a compile-visible mistake, not a silent one.

**All numerals use `tabular-nums`** — applied automatically to `.font-mono` and
`[data-numeric]`. Scores in a column that don't align are a bug.

**Why this pairing.** Neue Montreal is a neo-grotesque with tight, even spacing that reads
as instrument labelling at large sizes; General Sans is a humanist companion that stays
legible at 15px in dense tables where Neue Montreal's tighter apertures would close up. The
mono is a system stack — zero bytes, and its only job is column alignment.

---

## 4 — Layout

| Property | Value |
|---|---|
| Content max width | 1280px (`--container-content`) — tables, grids, chrome |
| Reading measure | 720px (`--container-prose`) — module text, instructions |
| Spacing steps | 4 · 8 · 12 · 20 · 32 · 48 · 80 · 128px only |
| Breakpoints | 375 (floor, base styles) · 768 tablet · 1280 desktop · 1600 wide |
| Grid | 12-column, symmetric, 20px gutter |
| Radius | 6px buttons · 8px cards · 4px tags |
| Z-ladder | base 0 · rail 10 · header 20 · overlay 30 · modal 40 · toast 50 |

### Density rule — airy chrome, dense data

| Context | Section rhythm | Internal padding |
|---|---|---|
| Public pages, module reading | 128px between sections | 32px inside cards |
| Praktikum lists, module detail | 80px | 20px |
| Tables, grading roster | 48px | 12px cells, 8px between controls |

An asisten entering 30 scores must not scroll to do it. A praktikan reading a module must
not feel crowded. Same scale, different rungs.

### Public page frame

```
┌────────────────────────────────────────────────────────────────┐
│  ◈ Controllab      Materi   Simulator   About        [ Masuk ] │ 72px, transparent
└────────────────────────────────────────────────────────────────┘
                              ↓ 128px

        Sistem Kendali                            text-3xl / 68px
        Laboratorium Teknik Elektro UI            text-lg / 22px, --text-muted
                              ↓ 32px
        [ Mulai Praktikum ]   [ Lihat Materi ]    primary + secondary
                              ↓ 128px
   ├──────────────── 1280px max, centered ────────────────┤

┌────────────────────────────────────────────────────────────────┐
│  ◈ CONTROLLAB                                                  │ footer
│  Praktikum    Materi    Lab         Lab Sistem Kendali         │
│  ·            ·         ·           Dept. Teknik Elektro UI    │
└────────────────────────────────────────────────────────────────┘
```

### App shell frame

```
┌────────────────────────────────────────────────────────────────┐
│  ◈ Controllab    Praktikum   Nilai        Kelompok 4  ◍ Fatih  │ 64px, STATIC
├──────────────────┬─────────────────────────────────────────────┤
│  MODUL 3         │  Modul 3 — Root Locus                       │
│  ▸ Materi        │  ───────────────────────────────            │
│    Pretest    ●  │                                             │
│    Laporan    ○  │  ├────── 720px reading measure ──────┤      │
│                  │                                             │
│  240px rail      │                                             │
│  (module only)   │                                             │
└──────────────────┴─────────────────────────────────────────────┘
```

The rail exists **only inside a module**. List pages are full width.

---

## 5 — Motion

Level 2. Everything is a CSS transition. **No JS on the animation hot path.**

| Moment | What moves | Duration | Easing |
|---|---|---|---|
| Hover — button, row, link | `background-color`, `color` | 120ms | `--ease-signal` |
| Press | `background-color` | 120ms | `--ease-signal` |
| Focus ring appear | `outline-color` | 120ms | `--ease-signal` |
| Nav indicator | `transform` | 180ms | `--ease-signal` |
| Header scroll state | `height`, `background-color`, `border-color` | 180ms | `--ease-signal` |
| Menu / popover in | `opacity`, `transform` 4px | 180ms | `--ease-signal` |
| Menu / popover out | `opacity`, `transform` 4px | 120ms | `--ease-exit` |
| Score saved | `background-color` flash to `--success` @12%, then out | 180ms in / 400ms out | `--ease-exit` |
| Toast in / out | `opacity`, `transform` 8px | 180ms / 120ms | `--ease-signal` / `--ease-exit` |

**Entrances decelerate (`--ease-signal`), exits accelerate (`--ease-exit`).** Never one
symmetric curve for both.

**The signature moment** is the header scroll transition — §6.

### Avoid

- Scroll-triggered reveals. Any of them. `lenis` is installed and **unused** — do not wire it.
- Page/route transitions.
- Anything over 200ms on a hover, press, or focus state.
- `transform: scale()` on press. Buttons change colour, they do not squish.
- Parallax, marquees, counters that tick up, typewriter text.
- Animating `width`, `height`, `top`, `left` on anything that repeats per-row.

---

## 6 — Signature element

**The status row.** Every module, for every praktikan, is one row carrying three cells —
pretest, tanya jawab, laporan — in tabular mono, separated by hairlines, with exactly one
accent mark on whatever needs attention. It is the atom of the entire system: it appears on
the praktikan's module list, inside the module header, and repeated down the asisten's
grading roster. Nothing else in the interface is seen as often.

The craft is that it stays legible at 13px, aligns perfectly down a column of thirty, reads
its own state without a legend, and is dense enough to grade from without ever feeling
cramped. There is no motif, no illustration and no metaphor — the row *is* the design, and
getting a dense data row to look effortless is the whole job. If this row is beautiful the
site is beautiful; if it isn't, no amount of decoration elsewhere will save it.

The **motion** signature is separate and deliberately small: the header, on first scroll
past 24px, collapses 72px → 56px and fades in its surface and bottom hairline over 180ms.
It happens once, it never re-triggers on the way back up until you're fully at rest at the
top, and it is the only chrome in the product that moves.

---

## 7 — Component patterns

### Buttons — 40px tall, `--radius-button` 6px, `text-sm` 15px/500, padding 0 20px

| State | Primary | Secondary | Ghost |
|---|---|---|---|
| Rest | bg `--accent`, label `#ffffff` **(5.01 — `--text` fails at 4.48, use pure white)** | bg transparent, 1px `--border-strong`, label `--text` | transparent, label `--text-muted` |
| Hover | bg `#ba2527` (label 5.55) | bg `--surface-raised` | label `--text`, bg `--surface` |
| Active | bg `#a31f21` | bg `--surface` | bg `--surface` |
| Focus-visible | + 2px `--accent` outline, 2px offset | same | same |
| Disabled | bg `--accent` @30% over `--bg`, label `--text-muted`, `cursor: not-allowed` | 1px `--border`, label `--text-muted` | label `--text-muted` |
| Loading | label holds, opacity 0.6, `aria-busy="true"` — **no spinner swap, no width change** | | |

Destructive actions use Primary. Red already means danger.

### Cards — `--radius-card` 8px

- bg `--surface`, 1px `--border`
- **Dark:** 1px `--edge-highlight` top border. No shadow — measured invisible on navy.
- **Light:** `--shadow-card` (`0 16px 32px rgb(11 20 32 / 0.10)`), no top highlight.
- Padding 32px airy / 20px dense.
- Interactive card: hover → bg `--surface-raised`, 120ms. Whole card is one hit target.

### Nav

- Rest `--text-muted`, hover `--text` (120ms), current `--text` + 2px `--accent` underline
- Active underline **scales from centre**, 180ms `--ease-signal`, and does not animate on
  first paint. Per-link, not a shared sliding rail: a rail needs cross-item measurement,
  resize observation and re-measurement on font load, and it jitters when any of those
  are wrong.
- `aria-current="page"` on the active link — required, not optional

### Inputs — 40px, `--radius-button` 6px, `text-sm`

| State | Spec |
|---|---|
| Rest | bg `--surface`, 1px `--border-strong`, text `--text` |
| Hover | border `--text-muted` |
| Focus | border `--accent` + global 2px outline |
| Error | border `--danger`, message below in `--danger` `text-meta`, `aria-invalid="true"` |
| Disabled | bg `--bg`, 1px `--border`, text `--text-muted` |

Score inputs use `--font-mono` + `inputmode="numeric"`.
Every input has a visible `<label>`. Placeholder is never the label.

### Links (inline in prose)

`--accent-text`, 1px underline at `0.2em` offset. Hover → `--text`, underline holds.
Underline is never removed — colour alone is not a link affordance.

### Focus rings

`2px solid --accent`, `2px` offset, on **everything** interactive. Set globally in
`@layer base`. **Never** `outline: none` without an equal-or-better replacement in the same
rule. This is the single most load-bearing accessibility decision in the system.

---

## 8 — Voice

**Indonesian UI, English technical terms.** Write `pretest`, `overshoot`, `root locus`,
`plotting`, `steady-state` — not translations. Everything else in Indonesian.

- Second person, informal-respectful: *"Kamu belum mengumpulkan laporan Modul 3."*
- Sentences under 20 words. One idea per sentence.
- Lead with state, then action: *"Terlambat 2 hari. Kumpulkan sekarang."*
- Numbers as numerals, always. Dates as `12 Agustus 2026`, never `12/08/26`.
- Errors say what happened and what to do. Never *"Terjadi kesalahan."*
- Empty states say what will appear, not that nothing is here.

**Banned:** seamless, leverage, cutting-edge, revolutionary, empower, unlock, journey,
delve, robust, elevate, "powered by", "world-class", exclamation marks in UI copy, emoji in
product chrome.

---

## 9 — Accessibility floor

**WCAG 2.2 AA. Non-negotiable.**

| Requirement | Value |
|---|---|
| Mobile floor | 375px. No horizontal scroll at 375px, any page. |
| Grading floor | 768px. Below it the roster is **read-only** — no cramped editing. |
| Text contrast | 4.5:1 body, 3:1 ≥24px. Audit in §2. |
| Non-text contrast | 3:1 — focus rings, input borders, status indicators |
| Keyboard | Every action reachable and operable. Visible focus at all times. |
| Tab order | Follows visual order. No positive `tabindex`. |
| Targets | 24×24px minimum (2.2 AA). Table row controls included. |
| Modals | Focus trapped, `Esc` closes, focus returns to trigger, `<body>` scroll locked and restored |
| Mobile menu | Same as modals. All four behaviours. |
| Status | Colour is never the only signal — always colour **+** text label |
| Live regions | Score saves announce via `aria-live="polite"` |

### `prefers-reduced-motion`

Global block in `globals.css` cuts animation to `0.001ms` and transitions to `0.01ms` —
off and instant, per Atlassian's guidance.

**The signature header transition specifically:** under reduced motion the header does not
animate between states. It renders directly in its scrolled state (56px, surface filled,
hairline present) as soon as `scrollY > 24`, and directly back at rest. The state change
still happens — it just has no tween. **The information is never lost, only the movement.**

Same rule for the score-saved flash: the `--success` tint applies and clears instantly
rather than fading. Nobody loses the confirmation.

---

## 10 — Non-goals

Blunt list. These are decisions, not preferences.

**Do not resemble `lkelui.com`.** Measured, it runs 17 colour families, 72 exotic-hue
utilities, 23 gradients, `backdrop-filter: blur(10px)`, the stock Tailwind type and radius
scales, and Poppins. It is the sibling lab and we share its *institution*, not its visual
language. Copying it is the single most likely failure mode here.

**Never build:**

- Warm cream background + high-contrast serif + terracotta accent. The default AI look.
- Near-black background with one acid-green or vermilion accent.
- Broadsheet hairline layout with zero radius everywhere.
- Purple-blue gradient hero, glassmorphism, floating blurred blobs.
- Generic 3-column feature grid with lucide icons in rounded squares.
- Uniform fade-in-on-scroll on every section.
- Stock Tailwind palette, stock type scale, or Poppins.
- Control-systems gimmickry — no step-response curves as progress bars, no Bode plots as
  decoration, no oscilloscope skeuomorphism. The domain shows through the content, never
  through the chrome. **Explicitly vetoed.**
- A second accent hue. Adding one means editing `globals.css`, and that is the point.
- Spinners, skeletons that shift layout, or any loading state that changes an element's size.
- A component library's default look. Radix ships unstyled; keep it that way.
- Scroll hijacking. `lenis` stays uninstalled from the render path.

**Do not:**

- Write a hex in a component. Ever.
- Use `--border` on a form control.
- Put accent-coloured text below 24px on dark.
- Remove a focus ring.
- Ship `Reckless` — it is trial-licensed.
- Add a font weight that isn't in `app/layout.tsx`.
