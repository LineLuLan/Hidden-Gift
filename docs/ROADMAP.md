# Roadmap — Hidden Gift

> Phase-by-phase plan. KHÔNG có timeline theo tuần (per CLAUDE.md §6). Mỗi phase có Definition of Done (DoD) rõ ràng. Source: CLAUDE.md §6 + Brief §4.

**Last updated**: 2026-05-18
**Current phase**: Phase 0 (Foundation)

---

## Phase 0 — Foundation

**Mục tiêu**: Repo, env, auth, schema, theme, deploy pipeline đủ để Phase 1 viết feature code không bị gián đoạn.

### DoD
- [ ] Repo scaffold Next.js 16 + TypeScript strict + Tailwind v4 + shadcn/ui done.
- [ ] `pnpm i && pnpm dev` chạy không lỗi trên macOS/Windows.
- [ ] Supabase project created (Singapore region), `.env.local` đầy đủ.
- [ ] Schema migrations (10 tables) + RLS policies + indexes pushed.
- [ ] RLS test script pass 100% (partner KHÔNG thấy secret/wish của bên kia).
- [ ] Better-Auth config với Google OAuth done. Signup/login/verify flow chạy được.
- [ ] Theme system light/dark toggle hoạt động.
- [ ] Vercel pipeline auto-deploy `dev` -> preview URL, `main` -> production URL.
- [ ] Sentry + PostHog instrumentation baseline (capture errors + page views).

### Critical files
- `supabase/migrations/001_initial_schema.sql`
- `supabase/migrations/002_rls_policies.sql`
- `supabase/migrations/003_indexes.sql`
- `lib/auth/config.ts`
- `lib/supabase/{client,server,middleware}.ts`
- `app/(auth)/{login,signup,verify}/page.tsx`
- `app/layout.tsx` (theme provider)

---

## Phase 1 — Couple Core (MVP)

**Mục tiêu**: 5 feature core hoạt động end-to-end. App có giá trị stand-alone, có thể demo cho couple thật.

### DoD
- [ ] Wishes CRUD (RLS enforce: partner không thấy wish của bạn).
- [ ] Secrets CRUD (asymmetric visibility, RLS critical).
- [ ] Scheduled Letters: compose, schedule, Trigger.dev job delivery đúng giờ TZ `Asia/Ho_Chi_Minh`.
- [ ] Emoji Ping: send + receive realtime qua Supabase Realtime.
- [ ] Memories vault: upload ảnh/video lên Cloudflare R2, RLS enforce account members only.
- [ ] Onboarding flow basic: signup -> verify -> create couple -> invite partner via email link.
- [ ] E2E test pass: signup -> create wish -> invite partner -> partner login -> partner KHÔNG thấy secret.
- [ ] Performance: LCP <2.5s on 3G (test bằng Lighthouse mobile).

### Gaps cần fill TRƯỚC khi build (xem `docs/EVALUATION.md`)
- Anniversary calc logic spec (gap #2).
- Rate limit values (gap #3).
- Couple invite protocol (gap #4).
- Image format spec (gap #5).

---

## Phase 2 — Viral Hooks

**Mục tiêu**: Built-in growth loops. User invite user (K-factor > 0).

### DoD
- [ ] Wish Card generator: export PNG 1080x1920, 5-7 templates, watermark, Web Share API.
- [ ] Solo Crush mode: onboarding split, Crush Vault, conversion CTA after 30 days.
- [ ] Curated Gift Ideas browser: 200 ideas seeded, filter by occasion + budget + persona.
- [ ] Onboarding wizard polish (animation, persona-aware copy).
- [ ] PostHog funnel tracking: signup -> verify -> onboarding -> link partner -> first wish -> first letter.
- [ ] K-factor measurement: track invite-sent vs invite-accepted.

### Gaps cần fill
- Wish Card template designs (gap #1) — hire designer or build Figma trước.

---

## Phase 3 — Monetization

**Mục tiêu**: Pro tier launch sau khi có >=200 active couples. Convert 2-4%.

### DoD
- [ ] PayOS integration: payment link generate, webhook verify, success/fail callbacks.
- [ ] Pro feature gates: more wishes (>5), more secrets, more letters, premium templates.
- [ ] Pricing page Vietnamese tone, P1 persona aware.
- [ ] Subscription renewal jobs (Trigger.dev): reminder emails, grace period handling.
- [ ] Free -> Pro conversion measurable trong PostHog.
- [ ] Refund/cancel flow tested.

### Gaps cần fill
- Breakeven % clarify (gap #7) — PM align với business.

---

## Phase 4 — Scale Prep

**Mục tiêu**: 5K MAU. Performance optimization, viral expansion, year-end recap.

### DoD
- [ ] Squad mode unlock (feature flag on for beta cohort).
- [ ] Wrapped recap deploy 1/12 hằng năm, MP4 export Pro tier.
- [ ] DB indexes optimization theo slow query log.
- [ ] CDN tuning (Cloudflare cache rules cho R2 assets).
- [ ] Realtime connection limit monitor (Supabase 500-connection cap).
- [ ] Spam moderation flow live (gap #8).

### Gaps cần fill
- Wrapped video config (gap #9).
- Spam moderation table + admin panel (gap #8).

---

## Out of Scope (MVP)

- Voice letters (Phase 5+).
- AI integration (re-evaluate ở 5K MAU per CLAUDE.md §10).
- Family mode (feature flag, no UI).
- Native mobile app (web-first, PWA optional Phase 4+).
- Multi-language (Vietnamese-first per CLAUDE.md Decision #7).
