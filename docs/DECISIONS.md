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
