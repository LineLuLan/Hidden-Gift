# Handoff — Hidden Gift

> Template cho daily/weekly sync giữa BE Lead, FE Dev, PM. Copy block bên dưới vào Slack/Discord/Notion daily.

**Mục đích**: Giảm sync meeting, tăng async clarity. PR description + commit log là source of truth chính, handoff chỉ summary.

---

## Daily Handoff Template

```
# Handoff — YYYY-MM-DD — <name>

## Yesterday (DONE)
- [link PR / commit] ngắn gọn done gì

## Today (DOING)
- [task ID trong CHECKLIST.md] đang làm gì
- ETA: ...

## Blockers
- Need from <role>: ...
- Decision pending: ...

## Notes for team
- API breaking change?
- Schema migration cần coordinate?
- Spec ambiguity tìm thấy?
```

---

## Weekly Handoff Template (Friday)

```
# Weekly Handoff — Week of YYYY-MM-DD

## Phase progress
- Phase X: %% done (link CHECKLIST.md)
- Phase X blockers cleared this week: ...
- Phase X blockers carried over: ...

## Metrics (sau khi launch)
- WAC (Weekly Active Couples): N (delta vs last week)
- Funnel drop-offs: ...
- PostHog top events: ...

## Risk / Decision needed
- ...

## Next week priorities
- BE: ...
- FE: ...
- PM: ...
```

---

## Handoff Channels

| Channel | Purpose | Format |
|---------|---------|--------|
| Slack/Discord #daily | Daily handoff post 9am | Daily template trên |
| Slack/Discord #weekly | Friday 5pm | Weekly template |
| GitHub PR | Code review + spec questions | Conventional Commits + screenshots |
| `docs/DECISIONS.md` | ADR log | Append-only ADR-NNN entries |
| `docs/CHECKLIST.md` | Live progress | Edit-in-place, commit on `dev` |

---

## Rules

1. **PR description > Slack message**: nếu thông tin quan trọng cho code, viết vào PR description, không Slack.
2. **CHECKLIST.md update mỗi PR**: PR merge thì update task status trong CHECKLIST cùng commit.
3. **Blocker = create GitHub issue + tag owner**: không để blocker chỉ trong Slack.
4. **Decision >= 30 phút discussion -> ADR**: ghi vào `docs/DECISIONS.md`, không để trôi.
5. **Spec ambiguity tìm thấy -> issue + flag trong EVALUATION.md**: cập nhật gap list.

---

## Handoff Examples

### Good
```
# Handoff — 2026-05-20 — BE Lead

## Yesterday
- PR #12 merge: schema migration 001_initial_schema.sql (10 tables done)
- RLS test script setup (`pnpm test:rls`)

## Today
- CHECKLIST: "Better-Auth config với Google OAuth"
- ETA EOD

## Blockers
- Need from PM: Couple invite UX spec (EVALUATION gap #4) — block flow design.

## Notes
- Schema change: thêm `accounts.feature_flags JSONB` column, FE chú ý parse khi đọc account.
```

### Bad (vague, không actionable)
```
- Đang làm auth, có gì hỏi sau.
```
