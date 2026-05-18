# Tracker Checklist — Hidden Gift

> Live progress tracker. Mirror CLAUDE.md §6 phases. Update khi mỗi task DONE / DOING / BLOCKED.

**Last updated**: 2026-05-18
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
- [~] Repo scaffold Next.js 16 + TypeScript + Tailwind v4 + Turbopack
- [~] Docs folder (EVALUATION, ROADMAP, CHECKLIST, HANDOFF, SETUP, GIT-WORKFLOW, DECISIONS)
- [~] `.env.example` với full service list
- [~] `.gitignore`, `.gitattributes`, `.nvmrc`, `.editorconfig`
- [~] `.github/` plumbing (CODEOWNERS, PR templates, CI workflow)
- [~] Git branches `dev`, `be`, `fe` created + pushed
- [~] README rewrite (entry point)
- [ ] Tooling configs (Husky, lint-staged, commitlint, Prettier, ESLint flat, Vitest, Playwright)
- [ ] `pnpm dev` chạy không lỗi -> Next.js root page render

### Supabase
- [ ] Supabase project created (Singapore region)
- [ ] `.env.local` populated với Supabase keys
- [ ] `supabase/migrations/001_initial_schema.sql` — 10 tables + enums
- [ ] `supabase/migrations/002_rls_policies.sql` — RLS cho mọi public table
- [ ] `supabase/migrations/003_indexes.sql` — index cho RLS columns + FKs
- [ ] `pnpm test:rls` script pass 100%
- [ ] Type generation: `pnpm supabase gen types typescript --local > lib/supabase/types.ts`

### Auth
- [!] Couple invite UX spec (BLOCKED — PM owner, ref `docs/EVALUATION.md` gap #4)
- [ ] Better-Auth config với Google OAuth
- [ ] `app/(auth)/{login,signup,verify}/page.tsx`
- [ ] Email verification flow (Resend)
- [ ] `app/api/auth/[...all]/route.ts` handler

### Theme + Layout
- [ ] Theme provider (light/dark) ở root layout
- [ ] App shell `app/(app)/layout.tsx` với sidebar/nav
- [ ] Mobile-first responsive shell tested trên iPhone 13 viewport

### Deploy
- [ ] Vercel link repo
- [ ] Branch deploy rules: `dev` -> preview, `main` -> production
- [ ] Env vars synced từ `.env.local` lên Vercel
- [ ] Sentry instrumentation (`instrumentation.ts`)
- [ ] PostHog instrumentation (`app/posthog-provider.tsx`)

---

## Phase 1 — Couple Core

### Wishes
- [ ] Server Actions `createWish`, `updateWish`, `deleteWish`, `archiveWish`
- [ ] UI: list, create form, edit dialog
- [ ] RLS test: partner KHÔNG thấy wish của bạn (assert empty result)
- [ ] Free tier limit: 5 active wishes (return error nếu >5)

### Secrets
- [ ] Server Actions `prepareSecret`, `updateSecret`, `markGifted`
- [ ] UI: prepare gift wizard, link với wish của partner
- [ ] RLS test: recipient KHÔNG thấy secret (assert empty)
- [ ] Notification khi `markGifted`: emit emoji ping tới recipient

### Letters
- [!] Anniversary calc logic spec (BLOCKED — BE Lead owner, ref EVALUATION gap #2)
- [ ] Server Action `createLetter` (draft -> scheduled)
- [ ] Tiptap rich text editor
- [ ] Trigger.dev job `deliverScheduledLetters` chạy hằng phút, TZ `Asia/Ho_Chi_Minh`
- [ ] Resend email integration cho letter delivery notification
- [ ] UI: compose, schedule picker, sent list, read view

### Emoji Pings
- [ ] Server Action `sendEmojiPing`
- [ ] Supabase Realtime subscription trên `emoji_pings` table
- [ ] `useOptimistic` cho instant UI feedback
- [ ] Notification toast (shadcn `sonner`)

### Memories
- [!] Image format spec (BLOCKED — DevOps owner, ref EVALUATION gap #5)
- [ ] Presigned URL generation cho Cloudflare R2 upload
- [ ] Upload UI với progress + drag-drop
- [ ] Gallery grid + lightbox
- [ ] RLS: tất cả account members có thể xem/upload

### Cross-cutting
- [!] Rate limit values (BLOCKED — BE Lead owner, ref EVALUATION gap #3)
- [ ] Rate limit middleware (Upstash) cho `/api/*` + Server Actions
- [ ] Zod schemas cho tất cả mutation inputs
- [ ] Error boundary + fallback UI
- [ ] Loading skeleton cho mỗi route

### Testing
- [ ] Vitest unit: utils, business logic
- [ ] RLS integration test (Supabase test framework)
- [ ] Playwright E2E: signup -> create wish -> invite -> verify partner blindness
- [ ] Manual test trên iPhone 13 + Samsung A series

---

## Phase 2 — Viral Hooks

- [!] Wish Card template designs (BLOCKED — Designer owner, ref EVALUATION gap #1)
- [ ] Wish Card export PNG 1080x1920 (html-to-image lib)
- [ ] Solo Crush mode onboarding split
- [ ] Crush Vault (private notes, RLS user-only)
- [ ] Solo -> Couple conversion CTA after 30 days
- [ ] Curated Gift Ideas: seed 200 ideas
- [ ] Gift Ideas browser UI (filter by occasion + budget + persona)
- [ ] PostHog funnel events instrumented

---

## Phase 3 — Monetization

- [!] Breakeven % conflict resolve (BLOCKED — PM owner, ref EVALUATION gap #7)
- [ ] PayOS sandbox account
- [ ] Payment link generation
- [ ] Webhook handler `/app/api/webhooks/payos/route.ts` với signature verify
- [ ] Subscription state machine (`subscriptions` table)
- [ ] Pro feature gates (server-side check)
- [ ] Pricing page `/app/(marketing)/pricing/page.tsx`
- [ ] Trigger.dev renewal reminder jobs

---

## Phase 4 — Scale Prep

- [ ] Squad mode UI (behind feature flag)
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
