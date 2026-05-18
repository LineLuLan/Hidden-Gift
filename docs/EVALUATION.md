# Evaluation — Source Documents

> Đánh giá độ hoàn thiện của 2 file spec hiện có trong repo, flag mọi mâu thuẫn và gap cần xử lý trước Phase 1.

**Ngày đánh giá**: 2026-05-18
**Người đánh giá**: Claude Code (theo yêu cầu BE Lead)

---

## Tóm tắt

| File | Kích thước | Hoàn thiện | Vai trò |
|------|------------|------------|---------|
| `CLAUDE.md` | 612 lines / 21KB | 100% | Quick reference + decisions locked |
| `Hidden_Gift_Brief.md` | ~1400 lines / 64KB | ~80% | Master brief, full spec source of truth |

**Nguyên tắc resolution khi conflict**: `CLAUDE.md` Section 2 (Critical Constraints) > `Hidden_Gift_Brief.md`. Mọi decision locked trong CLAUDE.md không được override.

---

## Phần 1 — CLAUDE.md

### Điểm mạnh
- 100% complete, 18 section đầy đủ cho Phase 0 to Phase 4.
- Decisions locked rõ ràng (Section 2): no AI, PayOS-only, pricing fix, stack fix.
- Coding standards cụ thể (TypeScript strict, no `any`, file <500 lines).
- Personas có weight rõ (P1 70%, P2 20%, P0 10%).
- Sample prompts (Section 18) giúp dùng Claude Code CLI hiệu quả.

### Điểm yếu / gap
1. **Section 6 git workflow lỗi thời**: viết `main -> develop -> feature/*` nhưng team đã chuyển sang `dev / be / fe`. Cập nhật sau khi merge scaffold (ghi nhận ADR-001).
2. **Section 4 folder structure thiếu**: `app/api/auth/[...all]/route.ts` (Better-Auth handler), `instrumentation.ts` (Sentry), `middleware.ts` ở root.
3. **Section 7 schema** chỉ là summary. Full DDL phải lấy từ Brief Section 7.
4. **Không có ADR log** — fix bằng cách tạo `docs/DECISIONS.md`.

---

## Phần 2 — Hidden_Gift_Brief.md

### Điểm mạnh
- 18 section end-to-end: vision, persona, phase, feature, stack, schema, cost, viral, monetization, compliance, risk, verification.
- Schema 10 tables (Section 7) đầy đủ enums + RLS policies inline.
- Cost projection (Section 8) chi tiết theo MAU tiers — rare cho early stage.
- Compliance VN PDPL 2026 (Section 11) — đáng giá, không nhiều dự án có.

### Điểm yếu / gap (cần fill trước Phase coding tương ứng)

| # | Gap | Phase blocker | Hành động |
|---|-----|---------------|-----------|
| 1 | Wish Card template designs (5 themes named, no asset) | Phase 2 | Design task riêng, hire designer hoặc tự build Figma |
| 2 | Anniversary calc logic (100-day, 1-year, custom date) | Phase 1 (Letters) | BE Lead spec rõ trước khi build Trigger.dev jobs |
| 3 | Rate limit values cụ thể (signup/h, share/d, wish create/min) | Phase 1 | Define trong `lib/rate-limit/config.ts` |
| 4 | Couple invite flow protocol (email vs QR vs SMS vs deep link) | Phase 0 (Auth) | UX spec từ PM trước scaffold auth |
| 5 | Image format spec (WebP/AVIF, sizes, compression) | Phase 1 (Memories) | DevOps decision, default WebP + lazy load |
| 6 | DPIA template (Section 11.3) | Pre-launch | Legal task, không block code |
| 7 | Breakeven conflict (Section 8: "5%" vs "2-4%") | Phase 3 (Pro launch) | PM clarify trước Pro launch |
| 8 | Spam/abuse moderation (không có table, không có flow) | Pre-launch | Future schema migration + admin panel |
| 9 | Wrapped video config (Remotion templates, music license) | Phase 4 (Dec 2026) | Defer, không block MVP |

---

## Phần 3 — Mâu thuẫn giữa 2 file (CRITICAL)

| # | Mâu thuẫn | CLAUDE.md nói | Brief nói | Resolution |
|---|-----------|---------------|-----------|------------|
| 1 | **AI integration** | Decision #1: NO AI trong MVP (Section 2) | Section 10.2: Claude Haiku gift suggestions + `ANTHROPIC_API_KEY` | CLAUDE.md wins. Bỏ `ANTHROPIC_API_KEY` khỏi `.env.example`. Dùng curated gift ideas (CLAUDE.md §10). |
| 2 | **Phase count** | 4 phases (Phase 0-4) | 5 phases (Phase 0-5) | Align về 4 phase. Brief Phase 5 (post-scale >50K MAU) merge vào Phase 4 hoặc out-of-scope MVP. |
| 3 | **Git flow** | `main -> develop -> feature/*` (§6) | Không nói rõ | Team đổi sang `dev / be / fe` -> log ADR-001 trong `docs/DECISIONS.md` |
| 4 | **Squad mode priority** | Decision #5: feature flag disabled | Section 2.3: "Squad P1 secondary" | CLAUDE.md wins. Squad flag default off, không UI trong MVP. |
| 5 | **Better-Auth vs Supabase Auth** | Better-Auth (Section 3) | Better-Auth (Section 6) | Đồng thuận, không conflict. |
| 6 | **Letter type** | Section 11 spec text-only | Section 9.2 Wrapped đề cập "voice message letters" Phase 5 | Voice letters out-of-scope MVP. Defer. |

---

## Kết luận

- **CLAUDE.md** đủ để start Phase 0 ngay. Chỉ cần update Section 6 git flow sau khi scaffold xong.
- **Brief** đủ cho Phase 0-1, có 9 gap cần fill rải rác Phase 1-4 (xem bảng trên).
- **9 gap** không block scaffold. Block từng phase cụ thể — track trong `docs/CHECKLIST.md`.
- **6 conflict** đã có resolution. CLAUDE.md là source of truth cho lock decisions.
- **Action items ngay sau scaffold**: cập nhật CLAUDE.md §6 git flow; PM viết Couple invite UX spec; BE Lead viết anniversary calc spec.
