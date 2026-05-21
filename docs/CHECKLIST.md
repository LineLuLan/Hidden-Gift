# Tracker Checklist — Hidden Gift

> Live progress tracker. Mirror CLAUDE.md §6 phases. Update khi mỗi task DONE / DOING / BLOCKED.

**Last updated**: 2026-05-19
**Source of truth**: CLAUDE.md §6 + `docs/ROADMAP.md`

---

## Legend

- `[ ]` = TODO (chưa start)
- `[~]` = DOING (đang làm)
- `[!]` = BLOCKED (cần input từ ai đó — note rõ owner)
- `[x]` = DONE

---

## Phase 0 — Foundation

### Scaffold

- [x] Repo scaffold Next.js 16 + TypeScript + Tailwind v4 + Turbopack
- [x] Docs folder (EVALUATION, ROADMAP, CHECKLIST, HANDOFF, SETUP, GIT-WORKFLOW, DECISIONS, API-KEYS-GUIDE)
- [x] `.env.example` với full service list
- [x] `.env.local` với Supabase + Google OAuth keys filled
- [x] `.gitignore`, `.gitattributes`, `.nvmrc`, `.editorconfig`
- [x] `.github/` plumbing (CODEOWNERS, PR templates, CI workflow)
- [x] Git branches `dev`, `be`, `fe` created + pushed
- [x] README rewrite (entry point)
- [x] Tooling configs (Husky, lint-staged, commitlint, Prettier, ESLint flat, Vitest, Playwright)
- [x] `pnpm build` chạy success (15 routes compile)

### Supabase

- [x] Supabase project created (Singapore region) — `ylssxjbmiwxpcpbemftm`
- [x] `.env.local` populated với Supabase keys + verified connection
- [x] `supabase/migrations/20260519000001_initial_schema.sql` — 8 tables + triggers + onboarding hook
- [x] `supabase/migrations/20260519000002_rls_policies.sql` — RLS cho 7 user-data tables (gift_ideas public)
- [x] `supabase/migrations/20260519000003_indexes.sql` — index cho RLS columns + FKs
- [x] `supabase/migrations/20260519000004_realtime.sql` — enable realtime cho 4 tables
- [x] `supabase/migrations/20260519000005_account_helper.sql` — my_account view
- [x] Hand-written `lib/supabase/types.ts` (swap with `pnpm db:types` sau khi push migrations)
- [ ] `pnpm supabase db push` chạy lên remote (action item: BE Lead, sau khi link project local)
- [ ] `pnpm test:rls` script pass 100% (action item: viết test sau)

### Auth

- [x] **ADR-002**: pivot Better-Auth → Supabase Auth (RLS native, ship faster)
- [x] `lib/auth/{server,actions,schema}.ts` — email/password + Google OAuth server actions, Vietnamese errors
- [x] `app/(auth)/{layout,login,signup,verify}/page.tsx`
- [x] `app/auth/{callback,signout}/route.ts` — OAuth callback + signout handlers
- [x] Google OAuth conditional (hidden if env keys missing)
- [!] Couple invite UX spec (BLOCKED — PM owner, ref `docs/EVALUATION.md` gap #4)
- [ ] Email verification flow polish (Resend wired — Phase 1.5)

### Theme + Layout

- [x] Theme tokens trong globals.css (light + dark, shadcn-compatible)
- [x] App shell `app/(app)/layout.tsx` + `components/layouts/app-shell.tsx` — sidebar desktop + bottom nav mobile
- [x] Mobile-first responsive shell (md: breakpoint, sticky topbar mobile)

### Deploy

- [ ] Vercel link repo (action item: BE Lead, ref API-KEYS-GUIDE §3)
- [ ] Branch deploy rules: `dev` → preview, `main` → production
- [ ] Env vars synced từ `.env.local` lên Vercel
- [ ] Sentry instrumentation (`instrumentation.ts` stub exists, wire khi có DSN)
- [ ] PostHog instrumentation (wire khi có project key)

---

## Phase 1 — Couple Core

### Wishes ✅

- [x] Server Actions `createWish`, `updateWish`, `deleteWish`, `toggleWishFulfilled`
- [x] UI: list page, create form, edit page, wish card with delete + toggle
- [x] Free tier limit: 5 active wishes (server-side `countActiveWishes` check)
- [x] Vietnamese validation messages, sonner toasts
- [ ] RLS test: partner KHÔNG thấy wish của bạn (action item: write Vitest after Phase 1.5)

### Secrets

- [x] Placeholder page `app/(app)/secrets/page.tsx` (Coming Soon)
- [x] Migration + RLS asymmetric visibility ready
- [ ] Server Actions `prepareSecret`, `updateSecret`, `markGifted` (defer: needs partner link)
- [ ] UI: prepare gift wizard, link với wish của partner
- [ ] RLS test: recipient KHÔNG thấy secret (assert empty)
- [ ] Notification khi `markGifted`: emit emoji ping tới recipient

### Letters

- [x] Placeholder page `app/(app)/letters/page.tsx` (Coming Soon)
- [x] Migration + RLS sender-only/recipient-after-delivery
- [!] Anniversary calc logic spec (BLOCKED — BE Lead owner, ref EVALUATION gap #2)
- [ ] Server Action `createLetter` (draft → scheduled) — defer: needs Trigger.dev
- [ ] Tiptap rich text editor (lib installed)
- [ ] Trigger.dev job `deliverScheduledLetters` chạy hằng phút, TZ `Asia/Ho_Chi_Minh`
- [ ] Resend email integration cho letter delivery notification
- [ ] UI: compose, schedule picker, sent list, read view

### Emoji Pings

- [x] Placeholder page `app/(app)/pings/page.tsx` (Coming Soon)
- [x] Migration + RLS + Supabase Realtime publication
- [ ] Server Action `sendEmojiPing` (defer: needs partner)
- [ ] Supabase Realtime subscription trên `emoji_pings` table
- [ ] `useOptimistic` cho instant UI feedback
- [ ] Notification toast (sonner)

### Memories

- [x] Placeholder page `app/(app)/memories/page.tsx` (Coming Soon, checks features.r2)
- [x] Migration + RLS account-shared visibility
- [!] Image format spec (BLOCKED — DevOps owner, ref EVALUATION gap #5)
- [ ] Presigned URL generation cho Cloudflare R2 upload (defer: needs R2 keys)
- [ ] Upload UI với progress + drag-drop
- [ ] Gallery grid + lightbox
- [ ] RLS: tất cả account members có thể xem/upload — DB ready

### Cross-cutting

- [x] Env validation (lib/env.ts) với graceful degradation cho 7 optional services
- [x] Feature flag derived từ env (features.googleAuth, features.r2, …)
- [x] Zod schemas cho wishes + auth inputs
- [!] Rate limit values (BLOCKED — BE Lead owner, ref EVALUATION gap #3)
- [ ] Rate limit middleware (Upstash) cho `/api/*` + Server Actions (defer: needs Upstash)
- [ ] Error boundary + fallback UI
- [ ] Loading skeleton cho mỗi route

### Testing

- [ ] Vitest unit: utils, business logic
- [ ] RLS integration test (Supabase test framework)
- [ ] Playwright E2E: signup → create wish → invite → verify partner blindness
- [ ] Manual test trên iPhone 13 + Samsung A series

---

## Phase 2 — Viral Hooks

- [!] Wish Card template designs (BLOCKED — Designer owner, ref EVALUATION gap #1)
- [ ] Wish Card export PNG 1080x1920 (html-to-image lib installed)
- [ ] Solo Crush mode onboarding split
- [ ] Crush Vault (private notes, RLS user-only)
- [ ] Solo → Couple conversion CTA after 30 days
- [ ] Curated Gift Ideas: seed 200 ideas (`gift_ideas` table ready)
- [ ] Gift Ideas browser UI (filter by occasion + budget + persona)
- [ ] PostHog funnel events instrumented

---

## Phase 3 — Monetization

- [!] Breakeven % conflict resolve (BLOCKED — PM owner, ref EVALUATION gap #7)
- [ ] PayOS sandbox account
- [ ] Payment link generation
- [ ] Webhook handler `/app/api/webhooks/payos/route.ts` với signature verify
- [ ] Subscription state machine (`subscriptions` table — extend schema)
- [ ] Pro feature gates (server-side check)
- [ ] Pricing page `/app/(marketing)/pricing/page.tsx`
- [ ] Trigger.dev renewal reminder jobs

---

## Phase 4 — Scale Prep

- [ ] Squad mode UI (behind feature flag — schema already supports `accounts.kind='squad'`)
- [!] Wrapped video config (BLOCKED — defer, ref EVALUATION gap #9)
- [ ] Wrapped Trigger.dev job 1/12
- [!] Spam moderation (BLOCKED — defer, ref EVALUATION gap #8)
- [ ] Performance: bundle analyzer, route splits
- [ ] Realtime connection monitor

---

## Pre-launch Compliance

- [ ] Privacy Policy tiếng Việt (hire legal translator)
- [!] DPIA template (BLOCKED — Legal owner, ref EVALUATION gap #6)
- [ ] User data export/delete portal (Settings)
- [ ] Granular consent checkboxes ở signup
- [ ] 30-day soft delete + hard delete cron
