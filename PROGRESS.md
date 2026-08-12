# PROGRESS

Controllab praktikum system. Simplified build — see `backend.md` for setup,
`design.md` for the visual contract, `research-notes.md` for how the design was chosen.

## Status

**All pages built and building green.** Running on placeholder data until `backend.md`
is run in Supabase.

```
npm run build   ✓ compiles
npm test        ✓ 7/7
npx tsc         ✓ clean
npx eslint      ✓ clean
```

## The system

| Route | Who | What |
|---|---|---|
| `/login` `/register` `/lupa-sandi` `/reset-sandi` | anyone | nama + NPM on signup |
| `/praktikum` | praktikan | 8 modules: pretest ✓, laporan ✓, average |
| `/praktikum/[slug]` | praktikan | PDF preview, Form link + tick, Drive-link form, scores |
| `/penilaian` | asisten | module picker |
| `/penilaian/[slug]` | asisten | sheet: praktikan × pretest/QnA/laprak + live average |
| `/simulator` | public | now lists the sims — `/simulator/pole-zero` is the real one |

## Data shape

**One `penilaian` row per (modul, praktikan)** carrying three numbers. No komponen enum,
no per-component rows. Average = plain mean of the three, `null` until all three exist —
a partial average reads as a final grade and causes complaints.

`lib/praktikum.ts` is placeholder; `backend.md` Step 13 has the real query bodies. No
component imports anything but its types and functions.

## Decisions

| | |
|---|---|
| Pretest | Google Form link + praktikan self-ticks. No quiz system. |
| Laporan | Google Drive link. No file upload. |
| Modul PDF | Plain URL. Drive `/view` auto-rewritten to `/preview` to embed. |
| Average | Plain mean of 3, null until complete |
| Forgot password | Supabase reset email → `/reset-sandi` |
| Role | Never self-selected. Signup always makes a praktikan; promote in SQL. |

## Removed in the simplification

`soal` table · `submit_pretest()` RPC · `FormPretest` · `/praktikum/[slug]/pretest` ·
`lib/praktikum.server.ts` · `ModuleRail` · `StatusBadge` · `CatatanInput` ·
per-praktikan grading detail page · `/dashboard`.

`server-only` is now an unused dependency — safe to `npm uninstall server-only`.

## Security posture

- RLS is the real boundary. `proxy.ts` redirects are convenience — a praktikan who
  bypasses them still gets zero rows.
- Praktikan have **no** insert/update policy on `penilaian`. Their two writes go through
  `tandai_pretest()` and `submit_laporan()`, neither of which can touch a nilai column.
  RLS is row-level, not column-level; a praktikan allowed to touch their own row could
  set their own grade.
- Deadline enforced inside `submit_laporan()`, not by hiding a button.
- `?next=` on `/login` is guarded against open redirect.

## Still to do

1. **You:** run `backend.md` Steps 0–12 in Supabase
2. **Then me:** Step 13 — swap the placeholder bodies for real queries
3. Delete the fake-data blocks in `lib/praktikum.ts`

## Not ours

`/`, `/about`, `/materi` are still placeholder `Section1` stubs — teammates' content.
The simulator page and `backend/main.py` belong to whoever built pole-zero; its
`localhost:8000` URL is hardcoded and `backend/__pycache__/` is committed to git.
