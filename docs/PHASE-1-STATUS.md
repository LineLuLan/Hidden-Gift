# Phase 1 Status — Wake-up Summary

> Tóm tắt build session 2026-05-19. Đọc khi dậy để nắm Phase 1 đang ở đâu.

---

## TL;DR

- ✅ **Build pass**: `pnpm build` thành công, 15 routes compile, 0 typecheck / lint errors.
- ✅ **Wishes feature end-to-end**: signup → login → tạo wish → toggle/edit/xoá. Free tier cap 5 active wishes.
- ✅ **Auth**: email/password + Google OAuth (Google nút chỉ hiện nếu env có key).
- ✅ **5 migrations** sẵn sàng push (chưa push remote — cần BE Lead chạy `pnpm supabase db push`).
- ✅ **9 commits**, mỗi commit theo conventional commits, split đúng branch be/fe per CODEOWNERS.
- 🟡 **4 placeholders**: secrets/letters/memories/pings hiện "Coming Soon" — chờ partner-invite flow + service keys.

**Decision pivot quan trọng**: dùng Supabase Auth thay vì Better-Auth (xem `docs/DECISIONS.md` ADR-002). User confirmed qua AskUserQuestion. Better-Auth dep giữ trong package.json deferred remove Phase 2.

---

## Việc cần BE Lead làm khi dậy

### 1. Apply migrations lên remote Supabase project

```bash
pnpm supabase login                      # interactive, mở browser
pnpm supabase link --project-ref ylssxjbmiwxpcpbemftm
pnpm supabase db push                    # đẩy 5 migrations lên remote
pnpm db:types                            # regen lib/supabase/types.ts khớp schema thực
```

Sau bước này → có thể `pnpm dev` và test login/signup thật.

### 2. Cấu hình Supabase Auth Dashboard

Vào https://supabase.com/dashboard/project/ylssxjbmiwxpcpbemftm/auth/providers:

- **Email provider**: enable, set "Confirm email" = on (default OK)
- **Google provider**: enable, paste `GOOGLE_CLIENT_ID` + `GOOGLE_CLIENT_SECRET` từ `.env.local`
- **URL Configuration** → Redirect URLs: thêm `http://localhost:3000/auth/callback`

### 3. Test end-to-end flow

```bash
pnpm dev
# Mở http://localhost:3000 -> redirect /login (vì chưa auth)
# Đăng ký mới qua /signup -> check email -> click link -> redirect dashboard
# Hoặc click "Tiếp tục với Google" -> Google consent -> redirect dashboard
# Vào /wishes -> tạo 5 wishes -> wish thứ 6 báo lỗi cap
# Toggle fulfilled / edit / delete đều work
```

### 4. Tiếp theo (Phase 1.5)

Còn 4 feature placeholder chờ build. Theo thứ tự priority:

1. **Partner invite flow**: tạo invite code → partner accept → upgrade solo → couple account. Đây là blocker cho 3 feature dưới.
2. **Secrets** (sau invite): asymmetric visibility, RLS đã ready, chỉ cần UI compose + reveal flow.
3. **Letters** (sau invite + Trigger.dev): Tiptap compose + schedule + delivery job.
4. **Memories** (sau invite + R2): R2 presigned upload + gallery.
5. **Emoji Pings** (sau invite): Supabase Realtime subscription, đã enable ở migration 004.

---

## Files mới/sửa (cho code review)

### Migrations (BE branch)

- `supabase/migrations/20260519000001_initial_schema.sql` — 8 tables + triggers
- `supabase/migrations/20260519000002_rls_policies.sql` — RLS với `(SELECT auth.uid())` pattern
- `supabase/migrations/20260519000003_indexes.sql` — performance indexes
- `supabase/migrations/20260519000004_realtime.sql` — Supabase Realtime publication
- `supabase/migrations/20260519000005_account_helper.sql` — `my_account` view

### Backend (BE branch)

- `lib/env.ts` — Zod env + feature flags (preprocess empty → undefined)
- `lib/supabase/{client,server,admin,middleware,types}.ts` — SSR clients
- `lib/auth/{server,actions,schema}.ts` — Supabase Auth helpers + server actions
- `lib/wishes/{schema,queries,actions}.ts` — Wishes CRUD logic
- `lib/utils/{cn,format}.ts` — class merger + VN-friendly formatters
- `app/auth/{callback,signout}/route.ts` — OAuth callback + signout
- `proxy.ts` — middleware refreshes Supabase session

### Frontend (FE branch)

- `app/(auth)/{layout,login,signup,verify}/page.tsx`
- `app/(app)/{layout,page}.tsx` — protected shell + home dashboard
- `app/(app)/wishes/{page,new,[id]/edit}/page.tsx` — wishes feature
- `app/(app)/{secrets,letters,memories,pings}/page.tsx` — Coming Soon placeholders
- `components/ui/{button,input,label,textarea,card,skeleton,alert,sonner}.tsx` — shadcn primitives
- `components/auth/{login-form,signup-form,google-button}.tsx`
- `components/layouts/app-shell.tsx` — sidebar + mobile nav
- `components/wishes/{wish-card,wish-form,wish-list}.tsx`
- `components/shared/coming-soon.tsx` — reusable empty state
- `app/globals.css` — Tailwind v4 @theme extended cho shadcn tokens

### Docs

- `docs/API-KEYS-GUIDE.md` — hướng dẫn đăng ký 9 service (NEW)
- `docs/DECISIONS.md` — append ADR-002 (Supabase Auth pivot)
- `docs/CHECKLIST.md` — Phase 0/1 progress updated
- `docs/PHASE-1-STATUS.md` — file này

---

## Đã skip / chưa làm có chủ đích

- **Better-Auth wire**: deferred (ADR-002), nếu cần multi-tenancy advanced thì revisit Phase 2
- **Marketing landing public**: `/` redirect /login khi unauth. Public landing có thể add ở `/welcome` sau
- **`pnpm db:types` regen**: hand-written types đã match migrations, regen sau khi push migrations
- **RLS Vitest test**: cần Supabase test framework, viết Phase 1.5
- **Sentry / PostHog wiring**: stub có sẵn (`instrumentation.ts`), wire khi user provide keys
- **Resend email**: server action `signUpWithEmail` set redirect, nhưng Supabase tự gửi confirmation email — không cần Resend cho signup verify. Resend dùng cho letter delivery (Phase 1.5)
- **Trigger.dev jobs**: skeleton `trigger.config.ts` có, jobs viết Phase 1.5 cùng Letters
- **Rate limit / Upstash**: deferred, chạy in-memory tạm

---

## Test khi dậy (manual smoke)

```bash
# 1. Build pass
pnpm build                # phải success

# 2. Typecheck pass
pnpm typecheck            # 0 errors

# 3. Lint pass
pnpm lint                 # 0 errors

# 4. Dev server
pnpm dev                  # mở http://localhost:3000
# Note: nếu chưa push migrations + chưa enable Google provider trong Supabase Dashboard,
# signup sẽ fail. Apply migrations + config provider trước.

# 5. After migrations applied:
# - /signup tạo tài khoản mới với email/password
# - Check Supabase Dashboard auth.users + accounts + account_members → có 1 row mỗi bảng
# - /login với account vừa tạo
# - /wishes → tạo 1 wish → list show ngay (revalidatePath work)
# - SELECT * FROM wishes trong Supabase Studio → wish hiện đúng owner
```

---

## Git log

```
d06ad32 chore: merge fe placeholder pages for nav completeness
9863c8e feat(ui): coming-soon placeholder pages for secrets/letters/memories/pings
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
f0bb202 chore: add phase 0 docs, env example, and github plumbing
3606124 Initial commit
```

All commits on `be`, `fe`, `dev` (sync'd). `main` untouched per workflow.
