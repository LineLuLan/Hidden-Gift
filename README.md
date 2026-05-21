# Hidden Gift

> Wishlist + silent gift coordination cho couple / squad / family Gen Z Việt Nam — danh tính người tặng được PostgreSQL Row-Level Security ẩn cho đến lúc "đã tặng".

**Studio**: 100B Studio (Hà Nội)
**Status**: Phase 0–4 complete + Phase 1.5 wishlist redesign · 32 routes · 18 migrations · 80+ commits

---

## Tech moat (ADR-003)

Wishlist owner thấy điều mình mong nhưng KHÔNG biết ai đang chuẩn bị / khi nào sẽ được tặng. Thành viên khác trong nhóm (non-recipient) THẤY active claims để tránh trùng quà. Recipient chỉ thấy "đã được tặng" sau khi claimer `markGifted` → wish lập tức `is_fulfilled` + show người tặng. Enforce ở Postgres RLS, không phải UI trick → differentiator thật vs Amazon Wishlist (lộ hết claim ngay khi reserve).

---

## Feature matrix

### Phase 1 — Couple Core (post ADR-003)

| Feature            | Description                                                                                                                       |
| ------------------ | --------------------------------------------------------------------------------------------------------------------------------- |
| **Wishes**         | Shared wishlist với account members; chỉ owner edit/delete. 5-cap free tier. Non-owner thấy nút "Tôi sẽ chuẩn bị" → silent claim. |
| **Partner Invite** | Atomic Postgres RPC `accept_invite` — wishes follow user vào account mới.                                                         |
| **Secrets**        | 3-way asymmetric: preparer always; non-recipient member sees active claims (squad coord); recipient sees only delivered.          |
| **Letters**        | Tiptap rich text + scheduled delivery. Trigger.dev cron fires email.                                                              |
| **Emoji Pings**    | Supabase Realtime — partner thấy toast khi bạn gửi.                                                                               |
| **Memories**       | Album chia sẻ. HEIC convert + 2048px resize client-side. R2 swap-ready.                                                           |

### Phase 2 — Viral hooks

- **Wish Card PNG export** — 4 templates, IG Story 1080×1920, native share + clipboard
- **Solo Crush mode** — crush profile + diary, kind switch, conversion CTA
- **Onboarding wizard** — 3-step setup: pick mode → profile/invite → review
- **Curated Gift Ideas** — 30 seed ideas, filter dipersona/budget, affiliate links với UTM
- **Tiptap rich text editor** — letters body (JSONB), backwards-compat với legacy text
- **Theme toggle** light/dark/system, no-FOUC inline script
- **Marketing landing** `/welcome` + `/about` (static)

### Phase 3 — Production infra

- **Observability** — Sentry (server/edge/client init), PostHog (client + server events)
- **Rate limit** — Upstash backend + in-memory fallback
- **Email** — Resend templates (welcome, letter delivered, invite) with no-op fallback
- **Trigger.dev** — letter delivery cron, account purge cron, yearly Wrapped cron
- **R2 storage swap** — feature-flagged adapter for memories
- **Vercel deploy** — `vercel.json` sin1 region, `.env.production.example`
- **Compliance** — Privacy Policy + Terms (PDPL 2026 aligned)

### Phase 4 — Scale prep

- **Profile avatar** — Supabase Storage avatars bucket, sidebar + member list
- **Data export + delete** — PDPL Article 16 (JSON export) + 30-day soft delete
- **Wrapped recap** — year-end stats page + PNG share + Dec 1 email cron
- **Squad / Family mode** — capacity-aware (8/12 members), role assignment, reusable invites
- **Affiliate links** — outbound redirect `/gift-ideas/go/[id]` with UTM + click counter
- **Email preferences** — per-user opt-out (letter / invite / wrapped / ping)
- **Bundle analyzer** — `ANALYZE=true pnpm build`
- **Health check** — `/api/health` returns DB ping status

---

## Quickstart

```bash
git clone https://github.com/LineLuLan/Hidden-Gift
cd Hidden-Gift
pnpm i
cp .env.example .env.local
# Fill Supabase + Google OAuth keys at minimum (see docs/API-KEYS-GUIDE.md)
pnpm supabase db push  # apply 17 migrations
pnpm dev
```

Open `http://localhost:3000` → unauth → redirect `/welcome` → `/signup` → onboarding.

**Verify auth flow**: docs/PHASE-1-STATUS.md §verify lists 17 manual checks.

---

## Architecture

```
Next.js 16 App Router (Server Components default)
├── proxy.ts (middleware)        — Supabase session refresh + / → /welcome redirect
├── instrumentation.ts            — Sentry init (NEXT_RUNTIME aware)
└── app/
    ├── (marketing)/              — public (welcome, about, privacy, terms)
    ├── (auth)/                   — login/signup/verify
    ├── (app)/                    — auth-gated; redirects to /onboarding if !onboardedAt
    │   ├── layout.tsx            — RealtimeToasts + NotificationBell mount
    │   ├── crush/                — solo mode hub
    │   ├── settings/             — avatar / mode / email prefs / data export
    │   ├── wrapped/              — year-end stats
    │   └── {wishes,secrets,letters,pings,memories,gift-ideas}/
    ├── api/health/               — DB ping status
    ├── auth/{callback,signout}/  — OAuth + POST signout
    ├── gift-ideas/go/[id]/       — affiliate redirect with UTM
    └── invite/[code]/            — public invite landing

lib/
├── supabase/                     — SSR-aware clients
├── auth/                         — Supabase Auth helpers + actions
├── env.ts                        — Zod-validated, client/server split
├── storage/r2.ts                 — Cloudflare R2 (S3-compatible) adapter
├── email/                        — Resend send + 3 VN templates
├── rate-limit.ts                 — Upstash + in-memory fallback
├── analytics/server.ts           — server-side PostHog events
├── notifications/                — unread count queries
├── wrapped/                      — year-end stats
└── {wishes,secrets,letters,pings,memories,crush,gift-ideas,profile,preferences,account}/

supabase/migrations/              — 17 migrations, all applied to remote
trigger/                          — 3 Trigger.dev cron jobs
```

---

## Tech stack

| Layer         | Choice                                    | Rationale                                              |
| ------------- | ----------------------------------------- | ------------------------------------------------------ |
| Framework     | Next.js 16 + React 19 + TypeScript strict | App Router, Server Components                          |
| Database      | Supabase Postgres (Singapore)             | RLS native — `auth.uid()` works for asymmetric privacy |
| Auth          | Supabase Auth (email + Google OAuth)      | Pivot khỏi Better-Auth — ADR-002                       |
| Styling       | Tailwind v4 + shadcn/ui primitives        | CSS-first, dark mode class-based                       |
| Realtime      | Supabase Realtime                         | Filtered by recipient_id + RLS                         |
| Storage       | Supabase Storage (default), R2 (opt-in)   | R2 cheaper egress at scale                             |
| Editor        | Tiptap                                    | letters body JSONB                                     |
| Cron          | Trigger.dev v3                            | letter delivery, account purge, yearly Wrapped         |
| Email         | Resend                                    | Verified domain `hello@hiddengift.vn`                  |
| Rate limit    | Upstash + fallback                        | login/signup/ping per-bucket presets                   |
| Observability | Sentry + PostHog                          | server/edge/client init, server-side events            |
| Deploy        | Vercel sin1 (Singapore)                   | Hobby free → Pro $20 at production traffic             |
| Payments      | PayOS                                     | 0% fee VN transfer (Phase 3 KYC required)              |

---

## Project status

- **Phase 0–4 code: complete + Phase 1.5 wishlist redesign (ADR-003)**
- **Migrations**: 17 applied to remote (`ylssxjbmiwxpcpbemftm`), migration 018 wishlist_redesign awaiting push
- **Routes**: 32 (4 static, 27 dynamic + API + middleware)
- **Build / typecheck / lint**: 0 errors
- **Branches**: `be` / `fe` / `dev` synced; `main` untouched until release
- **Live integrations**: Supabase + Google OAuth ✓
- **Stub integrations** (activate when keys present): Sentry, PostHog, Upstash, Resend, Trigger.dev, R2

---

## Docs

| File                                                 | Purpose                                                            |
| ---------------------------------------------------- | ------------------------------------------------------------------ |
| [`CLAUDE.md`](./CLAUDE.md)                           | Project blueprint, locked decisions                                |
| [`docs/API-KEYS-GUIDE.md`](./docs/API-KEYS-GUIDE.md) | 9-service registration walkthrough                                 |
| [`docs/SETUP.md`](./docs/SETUP.md)                   | Tier-grouped service signup                                        |
| [`docs/DEPLOY.md`](./docs/DEPLOY.md)                 | Production deployment 7-step guide                                 |
| [`docs/PHASE-1-STATUS.md`](./docs/PHASE-1-STATUS.md) | Latest status snapshot + verification flow                         |
| [`docs/DECISIONS.md`](./docs/DECISIONS.md)           | ADR log (001 branch model, 002 Supabase Auth, 003 shared wishlist) |
| [`docs/GIT-WORKFLOW.md`](./docs/GIT-WORKFLOW.md)     | Branch rules + commit convention                                   |
| [`docs/CHECKLIST.md`](./docs/CHECKLIST.md)           | Live progress tracker                                              |
| [`docs/ROADMAP.md`](./docs/ROADMAP.md)               | Phase 0–4 definition of done                                       |
| [`docs/EVALUATION.md`](./docs/EVALUATION.md)         | Spec gaps + resolutions                                            |
| [`docs/HANDOFF.md`](./docs/HANDOFF.md)               | Daily/weekly sync template                                         |

---

## Common commands

```bash
pnpm dev               # Turbopack dev server
pnpm build             # Production build
pnpm typecheck         # tsc --noEmit
pnpm lint              # ESLint flat config
ANALYZE=true pnpm build  # Bundle analyzer

pnpm test              # Vitest unit tests
pnpm test:e2e          # Playwright

pnpm db:types          # Regen Supabase types (needs Docker)
pnpm supabase db push  # Apply migrations to remote

pnpm trigger:dev       # Trigger.dev local
pnpm trigger:deploy    # Deploy cron jobs
```

---

## License

Proprietary © 100B Studio. Source available for review/audit; not for redistribution.
