# FE Pull Request -- fe -> dev

## Summary
<!-- 1-2 sentences. Link CHECKLIST.md task. -->

## Scope (frontend specific)
- [ ] Page route mới (`app/(app)/*` / `app/(auth)/*` / `app/(marketing)/*`)
- [ ] Component mới (`components/*`)
- [ ] shadcn primitive added
- [ ] Layout / theme change
- [ ] Form (React Hook Form + Zod)
- [ ] State management (Zustand / Tanstack Query)
- [ ] Animation / micro-interaction
- [ ] Marketing site copy / SEO

## Phase / Persona
- Phase: <!-- 0 / 1 / 2 / 3 / 4 -->
- Persona check: <!-- "Linh 21t có hiểu trong 5s không?" pass / not -->

## Test plan
- [ ] `pnpm typecheck` pass
- [ ] `pnpm lint` pass
- [ ] `pnpm test` (component tests)
- [ ] Chrome desktop tested
- [ ] iPhone 13 viewport tested (Chrome DevTools 390x844)
- [ ] Samsung A series viewport (412x915)
- [ ] Dark mode tested
- [ ] Keyboard navigation tested (a11y)
- [ ] `pnpm test:e2e` (nếu critical flow)

## Performance budget
- [ ] LCP <2.5s on 3G throttle (Lighthouse mobile)
- [ ] CLS <0.1
- [ ] Bundle size delta <50KB gzipped (xem CI bundle analyzer)
- [ ] Images: WebP, lazy load, responsive `srcset`

## Accessibility
- [ ] Semantic HTML (`<button>`, `<nav>`, `<main>`, etc.)
- [ ] ARIA labels cho interactive elements không có text
- [ ] Color contrast >= 4.5:1 (text) / 3:1 (UI components)
- [ ] Focus visible
- [ ] No keyboard trap

## Screenshots / Videos
<!-- Before / After. Loom cho complex flow. -->
- Desktop:
- Mobile (iPhone 13 viewport):

## API contract dependencies
<!-- Server Actions / API endpoints cần từ BE? Type imports? -->

## Follow-ups for BE
<!-- Cần BE thêm endpoint / migration? -->
