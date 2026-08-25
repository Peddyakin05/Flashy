# Flashy

A fast, modern **academic-opportunity (scholarship) aggregator** for Nigerian and international students. Phase 1 focuses on discovery: a clean, card-based catalogue with instant filtering, a scannable eligibility banner on every listing, a deterministic eligibility checker, and verified direct-apply links with one-click WhatsApp sharing.

Built for excellent Core Web Vitals — mostly server-rendered, tiny client islands, fixed-dimension media (CLS ≈ 0), and instant client-side filtering with no per-keystroke network round-trips.

## Tech stack

| Concern | Choice |
| --- | --- |
| Framework | Next.js 15 (App Router, TypeScript, RSC) |
| Database | Supabase (PostgreSQL) via `@supabase/ssr` |
| Styling | Tailwind CSS v3.4 + CSS-variable theming |
| UI primitives | Hand-authored shadcn/ui-style components (no Radix) + `lucide-react` |
| Validation | Zod (single source of truth for types) |

## Features (Phase 1)

- **Quick eligibility banner** — scannable tags on every card: funding, study level, CGPA cut-off, destination, and a colour-coded deadline countdown.
- **Interactive filter bar** — multi-select Discipline / Level / Country, tri-state funding, and free-text search. Filtering is instant (client-side) and the URL stays in sync, so any result set is shareable and refresh-safe.
- **Sticky action bar** — verified direct apply link (opens the official page) plus one-click WhatsApp share and native share/copy. Fixed to the bottom on mobile, sticky sidebar on desktop.
- **Eligibility checker** — a lightweight, **deterministic** engine (no API/LLM calls). Enter CGPA, level, field and destination for an instant, private, per-criterion pass/fail breakdown.
- **Runs before Supabase is configured** — the data layer transparently falls back to bundled sample data, so `pnpm dev` works the moment you clone.

## Getting started

Prerequisites: **Node 18.18+** and **pnpm**.

```bash
pnpm install
pnpm dev
```

Open http://localhost:3000. With no `.env.local`, the app serves five bundled sample opportunities.

### Connect Supabase (optional for Phase 1)

1. Create a project at [supabase.com](https://supabase.com).
2. Run [`schema.sql`](./schema.sql) in the Supabase SQL editor. It creates the tables, enum, indexes, RLS policies, the `updated_at` trigger, and the `increment_scholarship_views` RPC.
3. Copy env vars and fill them in:
   ```bash
   cp .env.local.example .env.local
   ```
   Set `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, and (for seeding) `SUPABASE_SERVICE_ROLE_KEY`.
4. Seed the sample data:
   ```bash
   pnpm seed
   ```

## Scripts

| Command | Description |
| --- | --- |
| `pnpm dev` | Start the dev server |
| `pnpm build` | Production build |
| `pnpm start` | Serve the production build |
| `pnpm lint` | ESLint |
| `pnpm typecheck` | `tsc --noEmit` |
| `pnpm seed` | Upsert sample scholarships into Supabase |

## Project structure

```
schema.sql                     # DB schema, RLS, indexes, RPC (deliverable #1)
scripts/seed.ts                # Seed script (deliverable #5)
src/
  app/
    (public)/                  # Public route group: layout, home, detail page
    layout.tsx  globals.css    # Root layout + design tokens
  components/
    cards/                     # ScholarshipCard + BookmarkButton island
    eligibility/               # EligibilityCheckCard (deliverable #4)
    filters/                   # FilterBar + ScholarshipExplorer (instant filtering)
    scholarship/               # ActionBar, DeadlineBadge, ProviderAvatar
    ui/                        # button, card, badge, input, label, skeleton
  lib/
    supabase/                  # SSR client/server/middleware + env (deliverable #2)
    eligibility.ts             # Deterministic eligibility engine
    filtering.ts               # Pure filter logic (shared server + client)
    scholarships.ts            # Validated data access with sample fallback
  types/index.ts               # Zod schemas + inferred types (deliverable #3)
```

## Security notes

- `SUPABASE_SERVICE_ROLE_KEY` is **server-only** — it bypasses RLS. It is never imported into client code and must never be prefixed with `NEXT_PUBLIC_`.
- RLS restricts the public/anon key to reading **published** scholarships and inserting subscribers; it can never read drafts or the subscriber list.
- View counts are bumped through a `SECURITY DEFINER` RPC so the anon key never needs table-level `UPDATE`.
- User-authored markdown is rendered without `dangerouslySetInnerHTML`, so listing content can't inject markup.

## Notes & next steps

- Filtering runs over the full published set in the browser for an instant feel. As the catalogue grows, push filters into the query (`.overlaps`, `.contains`, `.textSearch`) — the GIN indexes in `schema.sql` are already in place.
- Bookmarks are stored per-device in `localStorage` (no account needed in Phase 1).
