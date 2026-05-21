# Decision Log — Hidden Gift

> Architectural Decision Records (ADRs). Append-only. Mỗi ADR có ID NNN tăng dần.

**Format**: ADR-NNN | Status | Date | Context | Decision | Consequences

---

## ADR-001 — Branch model 3-branch (dev/be/fe) thay cho main/develop/feature

- **Status**: Accepted
- **Date**: 2026-05-18
- **Author**: BE Lead

### Context

CLAUDE.md §6 (Version 1.0) đề xuất git flow chuẩn 3-tier:

```
main -> develop -> feature/*
```

Team thực tế chỉ có 2 dev (BE Lead + FE Dev) + 1 PM. Model này tạo merge overhead không cần thiết:

- Mỗi feature đều cần branch riêng -> nhiều PR nhỏ.
- `develop` trở thành staging duplicate `main`.
- Conflict resolution nặng khi BE và FE đụng utils chung.

### Decision

Đổi sang model 3-branch role-based:

```
main (locked sau scaffold) -> dev (integration) -> {be, fe} (long-lived per role)
```

- `main`: chỉ 1 lần touch (scaffold push). Vĩnh viễn không chạm nữa.
- `dev`: integration, target của mọi PR.
- `be` / `fe`: long-lived feature branches per role. PR vào `dev`. KHÔNG delete sau merge.
- Sync `dev -> be` và `dev -> fe` định kỳ để tránh drift.

### Consequences

**Positive**:

- Giảm số PR template / branch tạo mới (chỉ 2 branch dev work).
- Mỗi role có ownership rõ ràng (CODEOWNERS map theo branch).
- `main` thực sự frozen -> giảm rủi ro deploy nhầm.

**Negative**:

- Long-lived branches dễ drift nếu không sync đều.
- Khó áp dụng `release/*` / `hotfix/*` chuẩn -> hotfix là exception case.
- Khi team grow >5 dev, model này không scale -> revisit ở Phase 4.

**Mitigation**:

- Weekly sync `be` và `fe` với `dev` (Friday EOD).
- Hotfix flow documented trong `docs/GIT-WORKFLOW.md` Scenario B.

### Follow-ups

- [ ] Update `CLAUDE.md` §6 inline để align (next PR sau scaffold).
- [ ] Set branch protection rules manual qua GitHub UI (BE Lead).
- [ ] Revisit khi team >5 dev (Phase 4 milestone).

### References

- `docs/GIT-WORKFLOW.md` — full rule spec
- CLAUDE.md §6 (outdated, sẽ update)

---

## ADR-002 — Auth provider: Supabase Auth (pivot khỏi Better-Auth)

- **Status**: Accepted
- **Date**: 2026-05-19
- **Author**: BE Lead (qua AskUserQuestion confirmation)

### Context

CLAUDE.md §3 list `better-auth v1.6+` trong tech stack với note "Multi-tenancy, OAuth". CLAUDE.md §7 lại spec RLS policies sử dụng `auth.uid()` (Supabase Auth native function).

Better-Auth không tích hợp native với Supabase RLS:

- Better-Auth tự manage `user`, `session`, `account`, `verification` tables (Postgres adapter)
- Supabase RLS `auth.uid()` decode JWT từ Supabase Auth schema, không phải Better-Auth session cookie
- Để bridge: cần custom JWT plugin issue token với shared secret = Supabase JWT secret, set custom claims `sub: user.id, role: authenticated`
- Cấu hình Dashboard Supabase JWT secret manual mỗi env

Cost-benefit cho Phase 1 MVP (5 features Couple Core, target 100 signups):

- Better-Auth bridge: +1-2 tuần dev + risk JWT secret rotation
- Supabase Auth: built-in Google OAuth provider + email/password, RLS works native, ship cleaner

### Decision

Phase 1 dùng **Supabase Auth** (`@supabase/ssr` + `supabase.auth.signInWithPassword`, `signUp`, `signInWithOAuth`).

- `better-auth` package giữ trong `package.json` nhưng không import / wire.
- Auth files dùng Supabase Auth: `lib/auth/{server,actions,schema}.ts`, `app/auth/{callback,signout}/route.ts`.
- RLS policies dùng `(SELECT auth.uid())` per CLAUDE.md §7 performance pattern.
- Google OAuth + email/password đều support, gated bởi `features.googleAuth` env flag (`lib/env.ts`).

Reconsider Better-Auth ở Phase 2+ nếu cần multi-tenancy advanced (couple invite role permissions, organization plugin).

### Consequences

**Positive**:

- Faster ship: 0 bridge code, RLS test work ngay khi migrations push
- Less moving parts: 1 auth provider = Supabase, không 2
- Native cookies + middleware refresh via `@supabase/ssr`

**Negative**:

- Better-Auth dep ~500KB unused trong `package.json` (deferred remove tới Phase 2 cleanup, tránh churn)
- Lose Better-Auth's organization/role plugin → custom build cho couple-invite flow Phase 2
- CLAUDE.md §3 ghi Better-Auth → cần update inline khi review Phase 1

**Mitigation**:

- Đánh dấu Better-Auth deferred trong `docs/CHECKLIST.md`
- Phase 2 reassess: nếu Supabase Auth đủ cho couple invite (custom server actions + RLS), không cần Better-Auth

### Follow-ups

- [ ] Update `CLAUDE.md` §3 inline note: Supabase Auth primary, Better-Auth deferred (Phase 1.5)
- [ ] Phase 2: evaluate Better-Auth vs custom invite flow cho squad/family features
- [ ] Cleanup: remove `better-auth` từ deps sau khi confirm không dùng (Phase 2)

### References

- `lib/auth/` — implementation
- `supabase/migrations/20260519000002_rls_policies.sql` — `(SELECT auth.uid())` usage
- `docs/API-KEYS-GUIDE.md` §2 — Google OAuth setup (works với Supabase Auth provider)

---

## ADR-003 — Shared wishlist + silent-claim model (pivot khỏi private-diary)

- **Status**: Accepted
- **Date**: 2026-05-20
- **Author**: BE Lead (qua user feedback session)

### Context

Phase 1 ship đầu tiên dùng `wishes` table như private diary (RLS `user_id = auth.uid()`):

- Linh tạo wish → chỉ Linh thấy. Dũng không biết Linh muốn gì.
- `secrets` table dùng cho free-form gift prep (Dũng tự nghĩ ra quà tặng Linh).

User feedback 2026-05-20: model này thiếu use case "couple muốn share wishlist để partner biết mua gì". Trải nghiệm thực tế:

- Partner phải hỏi miệng / đoán → friction cao
- Squad/family birthday coordination không có cơ chế hỗ trợ
- Privacy moat ban đầu (Linh không biết Dũng prepare gì) chỉ enforce 1 chiều, không đủ giá trị

So sánh với Amazon Wishlist (đối thủ rõ ràng nhất):

- Amazon: list shareable nhưng KHÔNG ẩn ai đã claim → mất element bất ngờ
- Hidden Gift (model mới): shareable + ẩn ai claim → giữ surprise = differentiator thật

### Decision

Pivot `wishes` + `secrets` schema sang **shared wishlist + silent claim**:

1. **wishes RLS SELECT**: `is_account_member(account_id)` (mở cho toàn account thay vì user_id only)
2. **wishes UPDATE/DELETE**: vẫn `user_id = auth.uid()` (chỉ owner edit)
3. **secrets RLS SELECT**: 3-way asymmetric
   - Preparer luôn thấy own claim
   - Non-recipient, non-preparer thành viên thấy active claims (status != 'delivered') → squad coordination
   - Recipient thấy chỉ khi `status = 'delivered'`
4. **claimWish action**: tạo `secrets` row với `linked_wish_id` set
5. **markGifted action**: flip secret → 'delivered' + flip linked wish → `is_fulfilled=true`

Implementation: migration `supabase/migrations/20260520000001_wishlist_redesign.sql`, server actions trong `lib/wishes/actions.ts`, UI variants ở `components/wishes/wish-card.tsx` (owner vs non-owner).

Pre-launch không có dữ liệu thật → migrate tất cả existing wishes sang shared mode, không cần data migration.

### Consequences

**Positive**:

- Khử friction "ngại nói cần gì" cho couple Gen Z
- Scale tự nhiên cho squad/family (8-12 members) gift coordination
- Asymmetric moat (owner không thấy claim) vẫn enforce ở DB → moat thật
- Tăng share viral: wishlist screenshot có caption "đoán xem anh tặng cái nào 🤭"
- Gen Z fit score: 5-6/10 (private-diary) → 7.6/10 (shared+silent-claim)

**Negative**:

- Materialism vibe risk → cần UX copy nhấn romance, không transactional
- Squad comparison pressure ("ai có wishlist dài hơn") → ẩn counter cho member khác
- Breakup → orphan claims; mitigation qua account-delete cron (Phase 4) đã có
- Multi-claim race condition trên markGifted → dùng optimistic predicate (`WHERE is_fulfilled = FALSE`)

**Mitigation**:

- Onboarding copy "Wish là điều mong, không phải bài test love"
- Show claim count to non-owner members chỉ first-claim time, không leak ai mới claim sau
- Realtime publication trên secrets RLS-filtered (Supabase 2024+) → Linh KHÔNG nhận INSERT broadcast của Dũng nếu Dũng prepare bí mật cho Linh

### Follow-ups

- [ ] Update CLAUDE.md §7 (DB schema) với mô tả mới — pending markdown sync (this PR)
- [ ] Update Hidden_Gift_Brief.md mô tả use case
- [ ] Add smoke test trên `tests/smoke/wishlist-claim.ts` cho 3-way RLS
- [ ] Phase 3 Pro: gate "image upload" + "URL preview" + "reveal_at schedule" trên wish cho Pro tier
- [ ] Phase 3 Pro: Zone Experience Pack (decoration / countdown / shared vault) — ref: project memory `project_zone_experience_pack`

### References

- `supabase/migrations/20260520000001_wishlist_redesign.sql`
- `lib/wishes/actions.ts` — `claimWish`, `unclaimWish`, `markGifted`
- `lib/wishes/queries.ts` — `getClaimStatusMap` batch fetch
- `components/wishes/wish-card.tsx` — owner vs non-owner variants
- `components/wishes/claim-button.tsx`

---

## ADR-NNN — Template (copy paste khi tạo ADR mới)

- **Status**: Proposed | Accepted | Deprecated | Superseded by ADR-NNN
- **Date**: YYYY-MM-DD
- **Author**: <name>

### Context

Tình huống / vấn đề cần quyết định. Forces đang tradeoff.

### Decision

Quyết định cụ thể. Active voice.

### Consequences

**Positive**: ...
**Negative**: ...
**Mitigation**: ...

### Follow-ups

- [ ] Action 1
- [ ] Action 2

### References

- Link liên quan
