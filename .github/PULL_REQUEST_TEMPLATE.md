# Pull Request

## Summary
<!-- 1-2 sentences về WHAT thay đổi và WHY. Reference task ID trong CHECKLIST.md nếu có. -->

## Scope
- [ ] Feature mới
- [ ] Bug fix
- [ ] Refactor (không change behavior)
- [ ] Docs / tooling / chore
- [ ] Schema migration (cần coordinate với team)
- [ ] Breaking change (cần align trước merge)

## Phase / Persona
- Phase: <!-- 0 / 1 / 2 / 3 / 4 -->
- Persona impact: <!-- P0 / P1 / P2 / all -->

## Test plan
- [ ] `pnpm typecheck` pass
- [ ] `pnpm lint` pass
- [ ] `pnpm test` pass
- [ ] Manual test trên Chrome desktop
- [ ] Manual test trên iPhone 13 viewport (Chrome DevTools)
- [ ] RLS test (nếu touch Supabase tables): `pnpm test:rls`
- [ ] E2E test (nếu critical flow): `pnpm test:e2e`

## Screenshots / Videos
<!-- UI changes: trước/sau. Loom hoặc GIF cho flow. -->

## Database / Migration impact
<!-- Có migration không? Backfill cần thiết? -->

## Deployment notes
<!-- Env vars mới? Vercel config thay đổi? -->

## Blockers / Follow-ups
<!-- Issues mở rộng, defer items. -->

## Checklist trước merge
- [ ] Updated `docs/CHECKLIST.md` với task status
- [ ] Updated `docs/DECISIONS.md` nếu có ADR mới
- [ ] No secrets / env vars committed
- [ ] No `console.log` debug leftover
- [ ] No `any` type (TypeScript strict mode)
- [ ] File size <500 lines (split modules nếu cần)
- [ ] Vietnamese UI text (English code comments)
