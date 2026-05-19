# Phase 1 Status — Wake-up Summary

> Cập nhật build session 2026-05-19. Đọc khi dậy để nắm Phase 1 + 1.5 đang ở đâu.

---

## TL;DR

**Phase 1 Couple Core — 5/5 features hoàn thành.** Memories vẫn placeholder (chờ R2 keys).

- ✅ Foundation: env + Supabase clients + Auth + 7 migrations applied lên remote
- ✅ Wishes: CRUD đầy đủ, free-tier cap 5, RLS user-private verified
- ✅ Partner Invite: SQL RPC `accept_invite` atomic, UI `/settings` + `/invite/[code]`, smoke test pass
- ✅ Secrets: asymmetric visibility (RLS tested), prepare/ready/deliver flow, recipient_id auto = partner
- ✅ Emoji Pings: send + realtime listener (Supabase Realtime channel) toast khi partner gửi
- ✅ Letters: compose/schedule/manual-deliver, body JSONB future-compat Tiptap
- 🟡 Memories: placeholder page, gates behind `features.r2`

**Build status**: `pnpm build` PASS — 22 routes, 0 typecheck / lint errors. `pnpm dev` ready in ~1s.

---

## Routes (22 total)

```
ƒ /                          → dashboard (auth-gated)
ƒ /login                     → email/password + Google OAuth
ƒ /signup                    → tạo tài khoản
ƒ /verify                    → chờ confirm email
ƒ /auth/callback             → OAuth code exchange
ƒ /auth/signout              → POST signout
ƒ /invite/[code]             → public invite landing (anon-OK via admin lookup)
ƒ /settings                  → account + invite code generation
ƒ /wishes                    → list (5-cap badge)
ƒ /wishes/new                → tạo wish
ƒ /wishes/[id]/edit          → sửa wish
ƒ /secrets                   → 3-section list (preparing/sent/received)
ƒ /secrets/new               → chuẩn bị bí mật cho partner
ƒ /secrets/[id]/edit         → sửa secret (chỉ preparer)
ƒ /letters                   → 4-section list (drafts/scheduled/sent/received)
ƒ /letters/new               → viết thư (subject + body + scheduled_for)
ƒ /letters/[id]              → đọc thư (sender luôn / recipient sau delivery)
ƒ /letters/[id]/edit         → sửa draft hoặc scheduled (block sau delivery)
ƒ /pings                     → composer + history với mark-all-read
ƒ /memories                  → placeholder (cần R2)
```

---

## Việc cần BE Lead làm khi dậy

### 1. (DONE qua AI) 7 migrations đã apply lên `ylssxjbmiwxpcpbemftm`

```
20260519000001_initial_schema.sql      ✓
20260519000002_rls_policies.sql        ✓
20260519000003_indexes.sql             ✓
20260519000004_realtime.sql            ✓
20260519000005_account_helper.sql      ✓
20260519000006_accept_invite.sql       ✓
20260519000007_fix_accept_invite.sql   ✓
```

### 2. Test end-to-end

```bash
pnpm dev
# Mở http://localhost:3000 -> redirect /login
```

Smoke flow:

1. Alice tạo account qua `/signup` (email/password hoặc Google)
2. Alice tạo wish ở `/wishes`
3. Alice vào `/settings` → bấm "Tạo mã mời" → copy link
4. Mở browser khác (incognito): Bob signup → mở link mời → "Nhận lời mời"
5. Verify cả 2 ở chung account (member list `/settings`)
6. Alice tạo bí mật `/secrets/new` cho Bob → status "Đang chuẩn bị"
7. Verify Bob không thấy bí mật ở `/secrets` (chưa deliver)
8. Alice bấm "Tặng ngay" → Bob refresh `/secrets` → thấy bí mật ở mục "Bạn nhận được"
9. Alice viết thư `/letters/new` schedule 5 phút sau → "Lên lịch gửi"
10. Đợi 5 phút → Alice vào `/letters` → bấm "Giao ngay" → Bob thấy thư
11. Alice + Bob mở 2 tab `/pings` → Alice send 💝 → Bob thấy toast realtime + entry trong list

### 3. Memories (defer)

Cần Cloudflare R2 keys (docs/API-KEYS-GUIDE.md §4). Sau khi `.env.local` có:

- `CLOUDFLARE_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_PUBLIC_URL`

Code `features.r2` = true → unlock UI. Code chưa wire upload presigned URL — Phase 1.5 implementation (xem memory về iPhone HEIC handling).

### 4. Letter auto-delivery (defer)

Hiện sender phải bấm "Giao ngay" manual sau scheduled_for. Tự động cần Trigger.dev job query `letters WHERE scheduled_for <= NOW() AND delivered_at IS NULL AND is_draft = false` mỗi phút. File `trigger/letter-delivery.ts` chưa viết. Phase 1.5 khi user cung cấp Trigger.dev keys.

---

## Architecture decisions

- **Supabase Auth thay Better-Auth** — ADR-002 trong `docs/DECISIONS.md`. RLS `auth.uid()` work native.
- **Hand-written Database types** — `lib/supabase/types.ts` chứa toàn bộ schema thay vì gen. Khi user có Docker, chạy `pnpm db:types` để regen từ remote.
- **No Database generic on createServerClient** — supabase-js v2 default fallback `Schema = never` khi Database không satisfy GenericSchema constraint, gây ambiguous .from(). Bỏ generic, query results untyped và cast manually.
- **Realtime per-row filter via RLS** — channel filter `recipient_id=eq.<userId>` + RLS double-check.
- **Wishes account_id migrates on invite accept** — `accept_invite` Postgres function moves user's wishes to target account atomically.
- **Plain textarea cho letter body** — Tiptap dep installed nhưng deferred wire. Body JSONB `{type:"text",content}` so future swap non-breaking.

---

## Files mới chính (cho code review)

### BE

- `lib/account/{queries,actions}.ts` — invite generation + acceptance
- `lib/wishes/{schema,queries,actions}.ts`
- `lib/secrets/{schema,queries,actions}.ts`
- `lib/letters/{schema,queries,actions}.ts`
- `lib/pings/{schema,queries,actions}.ts`
- `supabase/migrations/20260519000006_accept_invite.sql`
- `supabase/migrations/20260519000007_fix_accept_invite.sql`

### FE

- `app/(app)/settings/page.tsx`
- `app/invite/[code]/page.tsx`
- `app/(app)/{wishes,secrets,letters,pings}/{page,new,[id]/edit}.tsx`
- `app/(app)/letters/[id]/page.tsx` (read view)
- `components/{account,wishes,secrets,letters,pings}/`
- `components/shared/coming-soon.tsx`

---

## Cost summary

Phase 1 dùng:

- Supabase free tier (1 project, 1 active connection at a time)
- Google OAuth free

Phase 1.5 sẽ cần:

- Trigger.dev free (letter delivery cron) — 100K runs/mo
- Cloudflare R2 free (memories upload) — 10GB
- Resend free (email notifications) — 3K/mo
- Upstash Redis free (rate limit) — 10K commands/day

Tổng Phase 1-2 launch chi phí dự kiến: ~$20/mo (chỉ Vercel Pro nếu prod traffic).

---

## Git log (cập nhật)

```
a4267aa chore: merge letters UI to dev
79ed52b feat(letters-ui): compose / schedule / deliver scheduled letters
82a7643 chore: merge be letters lib
9e48749 feat(be): letters lib — save draft/schedule, manual deliver, delete
aa8b002 chore: merge fe pings UI + realtime
24f3dd9 feat(pings-ui): emoji ping composer + list + realtime listener
fc12f21 chore: merge be pings lib
6852d53 feat(be): emoji pings — send/mark read server actions + queries
6db834a chore: merge fe secrets UI
4e3f61b feat(secrets-ui): prepare/list/edit secret with asymmetric visibility
cc12e10 chore: merge be secrets lib
fd640e8 feat(be): secrets server actions + queries
03c28d4 chore: merge fe partner invite UI
89ab4e9 feat(invite): partner invite UI + auth next= flow
98e1fcb chore: merge be partner invite flow
750d09c feat(be): partner invite flow — accept_invite RPC + server actions
690800f chore: merge be migration ordering fix
a6c442a fix(db): order is_account_member function AFTER tables in migration 001
fb97968 chore: merge be phase 1 status docs
5e3435b docs: phase 1 status + checklist update
be40784 chore: merge be env validation fix
ecefe9a fix(be): env validation accepts empty strings for optional URL fields
85d6a94 chore: merge fe auth + app shell + wishes UI
bea35c4 feat(ui): auth pages + app shell + wishes feature end-to-end
350c2ff chore: merge be wishes lib + adr-002
5e6df03 feat(be): wishes lib + adr-002 + database types
60095e9 chore: merge fe shadcn primitives into dev
8d02b17 feat(ui): shadcn primitives for phase 1
d922f9f chore: merge be phase 1 backend foundation into dev
58262a8 feat(be): phase 1 supabase auth + db foundation
d5992ff feat: phase 0 scaffold -- next.js 16 + tooling + folder structure
```

29 feature/chore commits + scaffold + initial. All on dev (synced be + fe), origin/main untouched.
