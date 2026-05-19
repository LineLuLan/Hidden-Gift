# Phase 1 Status — Wake-up Summary

> Cập nhật build session 2026-05-19 sau khi build memories. Phase 1 hoàn tất.

---

## TL;DR

**Phase 1 Couple Core — 6/6 features hoàn thành.** Memories dùng Supabase Storage làm MVP backend (R2 swap-ready khi có keys).

- ✅ Foundation: env + Supabase clients + Auth + 10 migrations applied
- ✅ Wishes: CRUD, free-tier cap 5, RLS user-private
- ✅ Partner Invite: SQL RPC `accept_invite` atomic, `/settings` + `/invite/[code]`, login `next=` flow
- ✅ Secrets: asymmetric visibility, prepare/ready/deliver flow
- ✅ Letters: compose/schedule/manual-deliver, body JSONB future-compat Tiptap
- ✅ Emoji Pings: send + realtime listener (Supabase Realtime) toast khi partner gửi
- ✅ Memories: HEIC convert + resize + Supabase Storage bucket + signed URLs + gallery + lightbox

**Phase 1.5 polish included:**

- ✅ Marketing landing `/welcome` + `/about` (public, redirect logic in proxy)
- ✅ Notification bell + unread badge trong nav
- ✅ Loading skeletons cho 6 routes + error boundary
- ✅ Profile edit (đổi display_name)
- ✅ Unified realtime listener cho pings/secrets/letters
- ✅ Dashboard cards 3-state (always / couple / soon) với "Mời partner" banner cho solo

**Build status**: `pnpm build` PASS — **25 routes**, 0 typecheck / lint errors.

**Smoke test E2E** (Node admin client) — **8/8 pass**:

1. Couple linked qua invite RPC ✓
2. Wishes RLS user-private ✓
3. Profile updateDisplayName ✓
4. Secrets asymmetric (preparing hidden, delivered unlocked) ✓
5. Letters delivery flip ✓
6. Pings recipient-visible ✓
7. Memories Supabase Storage upload + account-shared visibility ✓
8. Notification counts accurate ✓

---

## Routes (25 total)

### Public (3)

```
ƒ /                          → root, proxy redirects unauth -> /welcome, auth -> dashboard
○ /welcome                   → marketing landing (hero + features + CTA, static)
○ /about                     → 100B Studio (static)
```

### Auth (5)

```
ƒ /login                     → email/password + Google OAuth, next= aware
ƒ /signup                    → tạo tài khoản
ƒ /verify                    → chờ confirm email
ƒ /auth/callback             → OAuth code exchange
ƒ /auth/signout              → POST signout
```

### App (16, auth-gated)

```
ƒ /                          → dashboard (linked: 5 features open / solo: gate)
ƒ /settings                  → profile + invite + members
ƒ /invite/[code]             → public invite landing (anon OK via admin lookup)
ƒ /wishes                    → list (5-cap badge)
ƒ /wishes/new
ƒ /wishes/[id]/edit
ƒ /secrets                   → 3-section list
ƒ /secrets/new
ƒ /secrets/[id]/edit
ƒ /letters                   → 4-section list
ƒ /letters/new
ƒ /letters/[id]              → read view
ƒ /letters/[id]/edit
ƒ /pings                     → composer + history + realtime
ƒ /memories                  → 4-col gallery + lightbox
ƒ /memories/upload           → drag-card uploader, HEIC convert
```

Plus middleware (`proxy.ts`).

---

## Migrations (10 applied lên `ylssxjbmiwxpcpbemftm`)

```
001_initial_schema       extensions + tables + triggers + handle_new_user
002_rls_policies         RLS for 7 tables (gift_ideas public)
003_indexes              cover RLS predicates + FKs
004_realtime             publication for emoji_pings/secrets/letters/memories
005_account_helper       my_account view
006_accept_invite        atomic invite acceptance RPC
007_fix_accept_invite    rename OUT params to avoid column ambiguity
008_fix_letter_update    split USING vs WITH CHECK so delivered_at can be set
009_fix_account_members  recursion fix using is_account_member SECURITY DEFINER
010_memories_storage     Supabase Storage bucket + RLS (account members read, uploader delete)
```

---

## Architecture decisions

- **ADR-001**: Branch model dev/be/fe role-based (not feature branches)
- **ADR-002**: Supabase Auth pivot khỏi Better-Auth (RLS native, ship faster)
- **Hand-written DB types** trong `lib/supabase/types.ts` — swap khi có Docker chạy `pnpm db:types`
- **No Database generic** trên `createServerClient` — supabase-js v2 fallback `Schema = never` gây ambiguous; cast manually
- **Realtime per-row filter** via `recipient_id=eq.<userId>` + RLS double-check
- **Wishes account_id migrates** on invite accept (atomic Postgres function)
- **Plain textarea letter body** — JSONB compat với Tiptap (swap Phase 2)
- **Supabase Storage Memories** (MVP) — R2 swap-ready, chỉ cần edit `lib/memories/actions.ts`
- **iPhone HEIC handling**: client-side `heic2any` + canvas resize 2048px max

---

## Còn lại — cần API keys mới (không buildable ngay)

| Feature                       | Cần keys                     | Note                                                                      |
| ----------------------------- | ---------------------------- | ------------------------------------------------------------------------- |
| Letter auto-delivery cron     | TRIGGER_SECRET_KEY           | Manual "Giao ngay" button works fallback                                  |
| Email notifications           | RESEND_API_KEY               | Signup confirm dùng Supabase default; letter delivered notification defer |
| Rate limiting                 | UPSTASH_REDIS_REST_URL       | In-memory fallback đủ dev                                                 |
| Server error tracking         | SENTRY_DSN                   | Console.error log                                                         |
| Analytics funnel              | NEXT_PUBLIC_POSTHOG_KEY      | Phase 2                                                                   |
| R2 storage swap               | CLOUDFLARE\_\*               | Supabase Storage đủ MVP                                                   |
| Plausible marketing analytics | NEXT_PUBLIC_PLAUSIBLE_DOMAIN | Cần domain trước                                                          |
| PayOS subscription            | PAYOS\_\*                    | Phase 3                                                                   |

---

## Còn lại — Phase 2+ (out of MVP scope)

- Wish Card PNG export (html-to-image installed)
- Solo Crush mode onboarding split
- Curated gift ideas seed (~200 ideas) + browser UI
- Tiptap rich text editor swap cho letters
- Wrapped recap (Phase 4)
- Squad / Family mode UI
- DPIA + Privacy Policy translation
- Theme toggle (dark mode CSS có, toggle button chưa)
- Vercel production deploy

---

## Việc verify khi dậy (manual smoke trên browser)

```bash
pnpm dev
# Mở http://localhost:3000
```

1. Unauth → redirect `/welcome` ✓ (proxy logic)
2. `/welcome` hero + 5 feature cards
3. `/signup` tạo Alice
4. Auto-redirect `/verify` (chờ email confirm — production cần verify Supabase email provider)
5. Tạo Bob qua incognito
6. Alice ở `/settings` → "Tạo mã mời" → copy URL `/invite/CODE`
7. Bob mở URL → "Nhận lời mời" → cả 2 "Đã liên kết partner"
8. Alice `/wishes/new` → tạo wish → list show
9. Alice `/secrets/new` → recipient prefilled Bob → tạo → status "Đang chuẩn bị"
10. Bob mở `/secrets` → KHÔNG thấy
11. Alice click "Đánh dấu Sẵn sàng" → "Tặng ngay" → Bob refresh → thấy bí mật
12. Alice `/letters/new` → write + "Lên lịch gửi" → list "Đã lên lịch"
13. Alice "Giao ngay" → Bob `/letters` thấy
14. Alice + Bob mở 2 tab `/pings` → Alice send 💝 → Bob toast realtime
15. Alice `/memories/upload` → chọn ảnh iPhone HEIC → preview chuyển JPEG → upload → gallery hiển thị
16. Bob `/memories` → thấy ảnh (account-shared)
17. Alice `/settings` đổi display_name → sidebar reflect

---

## Git state

```
HEAD: 19d28bc — feat(ui): unlock Memories card on dashboard
be / fe / dev all synced @ 19d28bc
main untouched (per workflow ADR-001)
```

40+ feature/chore commits ship Phase 1 + Phase 1.5 polish + Memories.

---

## Files mới chính

### BE (`lib/`)

- `lib/env.ts` — Zod env client/server split
- `lib/supabase/{client,server,admin,middleware,types}.ts` — SSR-aware
- `lib/auth/{server,actions,schema}.ts` — Supabase Auth
- `lib/account/{queries,actions}.ts` — invite + profile
- `lib/wishes/{schema,queries,actions}.ts`
- `lib/secrets/{schema,queries,actions}.ts`
- `lib/letters/{schema,queries,actions}.ts`
- `lib/pings/{schema,queries,actions}.ts`
- `lib/memories/{schema,queries,actions,client-prep}.ts`
- `lib/notifications/queries.ts`

### Migrations (`supabase/migrations/`)

- 10 migrations all applied to remote

### FE (`app/` + `components/`)

- `app/(marketing)/{layout,welcome,about}/`
- `app/(auth)/{layout,login,signup,verify}/`
- `app/(app)/{layout,page,settings,wishes,secrets,letters,pings,memories}/...`
- `app/auth/{callback,signout}/route.ts`
- `app/invite/[code]/page.tsx`
- `app/{global-,(app)/}error.tsx`
- Per-route `loading.tsx` cho 6 features
- `components/ui/` — 8 shadcn primitives
- `components/account/` — invite-card, accept-invite-form, profile-form
- `components/wishes/` — list, card, form
- `components/secrets/` — list, card, form
- `components/letters/` — list, card, form
- `components/pings/` — composer, list, listener (legacy)
- `components/memories/` — uploader (HEIC + resize), grid (lightbox)
- `components/shared/` — coming-soon, page-skeleton, realtime-toasts
- `components/layouts/` — app-shell, notification-bell
- `components/auth/` — login-form, signup-form, google-button

### Docs

- `docs/{API-KEYS-GUIDE,CHECKLIST,DECISIONS,EVALUATION,GIT-WORKFLOW,HANDOFF,PHASE-1-STATUS,ROADMAP,SETUP}.md`

---

## Cost summary

Phase 1 dev: **$0** (Supabase free + Google OAuth free + local dev).
Phase 1-2 launch ước tính: ~$20/mo (Vercel Pro nếu deploy production).
