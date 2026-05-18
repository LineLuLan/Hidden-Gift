# BE Pull Request -- be -> dev

## Summary
<!-- 1-2 sentences. Link CHECKLIST.md task. -->

## Scope (backend specific)
- [ ] Server Action mới
- [ ] API route mới (`/app/api/*`)
- [ ] Supabase migration
- [ ] RLS policy change
- [ ] Trigger.dev job
- [ ] `lib/` utility / config
- [ ] Type generation từ Supabase
- [ ] PayOS / Resend / R2 integration

## Phase
- Phase: <!-- 0 / 1 / 2 / 3 / 4 -->

## Test plan
- [ ] `pnpm typecheck` pass
- [ ] `pnpm lint` pass
- [ ] `pnpm test` (vitest unit)
- [ ] `pnpm test:rls` (Supabase RLS tests) — **MANDATORY nếu touch policies**
- [ ] Manual API test (curl / Thunder Client / Postman)
- [ ] Schema validation: `pnpm supabase db push --dry-run`

## Database impact
- [ ] No schema change
- [ ] Migration file added (`supabase/migrations/NNN_*.sql`)
- [ ] RLS policy updated (test cả USING và WITH CHECK)
- [ ] Index added cho RLS column / FK / hot query
- [ ] Backfill script needed? (link script nếu có)
- [ ] Down migration ready? (rollback strategy)

## Security checklist
- [ ] Input validation Zod (server side)
- [ ] Rate limiting áp dụng (Upstash)
- [ ] No SQL string concat (luôn parameterized query)
- [ ] Secret không leak vào response
- [ ] RLS enforced ở DB layer (không chỉ UI)

## API contract changes
<!-- Nếu breaking, list endpoint + old/new shape. Coordinate với FE trước merge. -->

## Performance notes
<!-- Query benchmark? N+1 nguy cơ? Cache strategy? -->

## Follow-ups for FE
<!-- Cần FE update gì? Type regen? Hook mới? -->
