# Hidden Gift

> Bí mật yêu thương cho hai người — app multi-tenant freemium SaaS cho couple Gen Z Việt Nam.

**Studio**: 100B Studio · **Stack**: Next.js 16 + React 19 + Supabase + Better-Auth · **Status**: Phase 0 (Foundation)

---

## Start here

| Đọc trước | Mục đích |
|-----------|----------|
| [`CLAUDE.md`](./CLAUDE.md) | Project blueprint, locked decisions, coding standards |
| [`docs/SETUP.md`](./docs/SETUP.md) | Đăng ký services + điền `.env.local` |
| [`docs/CHECKLIST.md`](./docs/CHECKLIST.md) | Tracker live, biết mình đang ở đâu |
| [`docs/GIT-WORKFLOW.md`](./docs/GIT-WORKFLOW.md) | Branch rules, PR flow, commit convention |
| [`docs/ROADMAP.md`](./docs/ROADMAP.md) | Phase 0–4 DoD |
| [`docs/EVALUATION.md`](./docs/EVALUATION.md) | Spec gaps + conflicts với resolution |
| [`docs/DECISIONS.md`](./docs/DECISIONS.md) | ADR log |
| [`docs/HANDOFF.md`](./docs/HANDOFF.md) | Daily/weekly sync template |

---

## Quickstart

```bash
# 1. Clone
git clone https://github.com/LineLuLan/Hidden-Gift.git
cd Hidden-Gift

# 2. Use Node 22 (per .nvmrc)
nvm use

# 3. Install deps (pnpm only)
pnpm install

# 4. Env vars
cp .env.example .env.local
# Điền keys theo docs/SETUP.md

# 5. Dev
pnpm dev
# -> http://localhost:3000
```

---

## Branches

```
main          (LOCKED — chỉ scaffold push lần đầu)
└── dev       (integration — default working branch)
    ├── be    (BE Lead feature work)
    └── fe    (FE Dev feature work)
```

PR flow: `be → dev` và `fe → dev` only. Không bao giờ chạm `main` sau scaffold. Xem [`docs/GIT-WORKFLOW.md`](./docs/GIT-WORKFLOW.md).

---

## Scripts

```bash
pnpm dev              # Dev server (Turbopack default)
pnpm build            # Production build
pnpm typecheck        # tsc --noEmit
pnpm lint             # ESLint flat config
pnpm format           # Prettier write
pnpm test             # Vitest unit
pnpm test:e2e         # Playwright E2E
pnpm test:rls         # Supabase RLS test (TODO Phase 0)
pnpm trigger:dev      # Trigger.dev local
pnpm db:types         # Regen Supabase types
```

---

## Tech stack

| Layer | Choice |
|-------|--------|
| Framework | Next.js 16 App Router |
| UI | React 19 + Tailwind v4 + shadcn/ui |
| Auth | Better-Auth + Google OAuth |
| DB | Supabase (PostgreSQL + RLS + Realtime) |
| Jobs | Trigger.dev v3 |
| Storage | Cloudflare R2 |
| Email | Resend |
| Cache / Rate limit | Upstash Redis |
| Payment | PayOS (Phase 3) |
| Analytics | PostHog + Plausible |
| Errors | Sentry |
| Hosting | Vercel |

---

## License

TBD. Proprietary cho 100B Studio cho tới khi public.
