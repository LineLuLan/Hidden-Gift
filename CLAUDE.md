# CLAUDE.md — Hidden Gift Project Blueprint

> **Context file cho Claude Code CLI.** Khi bạn chạy `claude` trong root directory của project này, Claude Code tự động đọc file này để hiểu context. Đặt ở `/hidden-gift/CLAUDE.md`.
>
> **Version**: 1.0 (May 18, 2026) — Aligned với Hidden Gift Brief v2

---

## 1. IDENTITY & MISSION

### Project
**Hidden Gift** — App multi-tenant freemium SaaS cho couple Gen Z Việt Nam.

### Studio
**100B Studio** — Team 3 người:
- **BE Lead** (project owner, người đang dùng Claude Code này)
- **Frontend Dev**
- **Product Manager**

### Mission (1 câu)
Giúp couple Gen Z VN ghi điều ước, chuẩn bị quà bí mật, gửi thư hẹn giờ, lưu kỷ niệm — với bí mật được enforce ngay tầng database (Supabase RLS), không chỉ ở UI.

### Differentiator
**Asymmetric visibility** — Partner A KHÔNG THỂ thấy wish/secret đang prepare của Partner B, ngay cả khi inspect database trực tiếp. Đây là tech moat, không phải UI trick.

---

## 2. CRITICAL CONSTRAINTS (CLAUDE PHẢI TUÂN THỦ)

### Decisions đã chốt — KHÔNG được tự đổi
1. **KHÔNG có AI integration** trong MVP. Bỏ hẳn Claude Haiku / OpenAI / Gemini. Thay bằng **curated gift ideas tĩnh** trong database (team tự build 200-300 ideas).
2. **MVP Free 100%** — không paywall trong Phase 1-2. Pro tier launch ở Phase 3 sau khi có traction.
3. **Pricing**: 29k VND/tháng hoặc 149k VND/năm (FIX, không thay đổi).
4. **Payment**: CHỈ PayOS. KHÔNG integrate Stripe/VNPay/Momo trong MVP.
5. **Core mechanic Couple trước**. Squad/Family chỉ là feature flag disabled, không build UI.
6. **Stack**: Next.js 16, React 19, Supabase, Better-Auth, Trigger.dev, Tailwind v4, shadcn/ui, Cloudflare R2.
7. **Language**: Vietnamese-first. Code comments tiếng Anh, UI text tiếng Việt.
8. **NO emoji trong code** (chỉ trong UI text).

### Anti-patterns — KHÔNG làm
- KHÔNG dùng `localStorage`/`sessionStorage` cho sensitive data (dùng Supabase + cookies)
- KHÔNG dùng SQL injection-prone string concatenation (luôn dùng Supabase client params)
- KHÔNG hardcode secrets vào code (luôn `.env.local`)
- KHÔNG skip RLS policies (mọi table public PHẢI có RLS)
- KHÔNG dùng `any` type trong TypeScript (strict mode bật)
- KHÔNG tạo file >500 lines (split thành modules)
- KHÔNG over-engineer — favor simple solutions

---

## 3. TECH STACK & VERSIONS

### Frontend
```
Next.js          16.2.x        App Router, Server Components, Turbopack default
React            19.2.x        Server Actions, useOptimistic, Compiler enabled
TypeScript       5.6+          Strict mode
Tailwind CSS     v4.3.x        CSS-first config, Rust engine
shadcn/ui        CLI v4        Copy-paste components
Tanstack Query   v5            Server state
Zustand          v5            Client state
React Hook Form  v7            Form state
Zod              v3            Validation
Tiptap           v2            Rich text editor (letters)
```

### Backend
```
Supabase         Latest        PostgreSQL 15 + RLS + Realtime
Better-Auth      v1.6+         Multi-tenancy, OAuth
Trigger.dev      v3            Scheduled jobs (letters, renewals)
PayOS SDK        @payos/node   Payment integration
Resend           v3            Transactional emails
Upstash Redis    Latest        Rate limiting, sessions
```

### Infrastructure
```
Vercel           Pro           Hosting, edge functions
Cloudflare R2    Latest        Media storage ($0 egress)
PostHog          Cloud         Analytics + feature flags
Sentry           Team          Error tracking
Plausible        Starter       Marketing site analytics
```

### Package manager
**pnpm** (không phải npm/yarn) — vì faster, disk-efficient, monorepo-ready.

---

## 4. PROJECT STRUCTURE

```
hidden-gift/
├── app/                          # Next.js App Router
│   ├── (auth)/                   # Auth pages (no layout shell)
│   │   ├── login/
│   │   ├── signup/
│   │   └── verify/
│   ├── (app)/                    # Main app (authenticated)
│   │   ├── layout.tsx            # App shell với sidebar/nav
│   │   ├── home/                 # Dashboard
│   │   ├── wishes/               # Wish list management
│   │   ├── secrets/              # Prepare gifts (RLS-protected)
│   │   ├── letters/              # Scheduled letters
│   │   ├── memories/             # Photo/video vault
│   │   ├── wrapped/              # Year-end recap
│   │   └── settings/
│   ├── (marketing)/              # Public landing
│   │   ├── page.tsx              # Home
│   │   ├── pricing/
│   │   └── about/
│   ├── api/
│   │   ├── webhooks/
│   │   │   └── payos/
│   │   └── trigger/              # Trigger.dev endpoints
│   └── layout.tsx                # Root layout
│
├── components/
│   ├── ui/                       # shadcn/ui primitives
│   ├── wishes/                   # Wish-related components
│   ├── secrets/                  # Secret components
│   ├── letters/                  # Letter compose/view
│   ├── memories/                 # Gallery, upload
│   ├── shared/                   # Cross-feature components
│   └── layouts/                  # Layout templates
│
├── lib/
│   ├── supabase/
│   │   ├── client.ts             # Browser client
│   │   ├── server.ts             # Server client
│   │   ├── middleware.ts         # Auth middleware
│   │   └── types.ts              # Generated DB types
│   ├── auth/
│   │   └── config.ts             # Better-Auth config
│   ├── payments/
│   │   └── payos.ts              # PayOS integration
│   ├── trigger/                  # Trigger.dev jobs
│   │   ├── letters.ts
│   │   ├── renewals.ts
│   │   └── wrapped.ts
│   ├── data/                     # Curated static data
│   │   ├── gift-ideas.ts         # 300 gift ideas (thay AI)
│   │   ├── card-templates.ts     # Wish card templates
│   │   └── prompts.ts            # Daily love note prompts
│   └── utils/
│
├── supabase/
│   ├── migrations/               # SQL migrations
│   └── seed.sql                  # Seed data
│
├── trigger/                      # Trigger.dev jobs (root)
├── public/
├── styles/
│   └── globals.css
├── .env.example
├── .env.local                    # GIT-IGNORED
├── CLAUDE.md                     # This file
├── README.md
├── next.config.ts
├── tsconfig.json
└── package.json
```

---

## 5. PERSONAS (CONTEXT CHO MỌI QUYẾT ĐỊNH UX)

Khi Claude code generates UI/copy/feature, **luôn reference persona**:

### P1 — Linh & Dũng (PRIMARY, 70% weight)
- 21 tuổi, sinh viên Hà Nội, couple 6 tháng
- Thu nhập 3-7M VND/tháng (sensitive về giá)
- Xài TikTok 4h/ngày, Instagram 2h/ngày
- Phone: iPhone 13/Samsung A series (mid-range)
- **Tone**: trẻ trung, dùng emoji, gần gũi, không formal
- **UX expectation**: load <2s, animation mượt, mobile-first

### P2 — Hương & Minh (SECONDARY, 20%)
- 24 tuổi, nhân viên văn phòng, couple long-distance 2 năm
- Thu nhập 10-15M VND/tháng (willing to pay)
- **Use case**: scheduled letters, countdown to next meet
- **UX expectation**: reliability > novelty

### P0 — Minh Single (10%, gateway persona)
- 19 tuổi, sinh viên có crush, chưa tỏ tình
- **Use case**: Solo Crush Diary mode (private)
- **Conversion**: 20%+ chuyển sang Couple Zone trong 90 ngày

**Rule**: Mọi screen Claude generate phải pass test "Linh 21t có hiểu trong 5 giây không?".

---

## 6. DEVELOPMENT WORKFLOW

### Phase-by-Phase (KHÔNG theo timeline tuần)

**Phase 0 — Foundation** (must complete trước Phase 1)
- [ ] Project setup (Next.js 16 + TypeScript + Tailwind v4)
- [ ] Supabase project init (Singapore region)
- [ ] Better-Auth config với Google OAuth
- [ ] Database schema migrations (xem section 7)
- [ ] RLS policies + test scripts
- [ ] Theme system (light/dark)
- [ ] Vercel deployment pipeline

**Phase 1 — Couple Core** (MVP must-have)
- [ ] Wishes CRUD (user-private, RLS enforce)
- [ ] Secrets CRUD (asymmetric visibility, RLS critical)
- [ ] Scheduled Letters compose + Trigger.dev delivery
- [ ] Emoji Ping (Supabase Realtime)
- [ ] Memories vault (Cloudflare R2 upload)

**Phase 2 — Viral Hooks** (build trước launch)
- [ ] Wish Card generator (PNG export to share)
- [ ] Solo Crush mode (single user)
- [ ] Curated Gift Ideas browser (thay AI)
- [ ] Onboarding wizard

**Phase 3 — Monetization** (sau launch, có 200+ active couples)
- [ ] PayOS integration
- [ ] Pro feature gates
- [ ] Pricing page
- [ ] Subscription renewal jobs

**Phase 4 — Scale Prep** (sau 5K MAU)
- [ ] Squad mode unlock (feature flag)
- [ ] Performance optimization
- [ ] Wrapped recap (deploy tháng 12)

### Git Workflow
```bash
main              # Production (auto-deploy Vercel)
└── develop       # Staging
    └── feature/* # Feature branches (PR vào develop)
```

**Commit convention**: Conventional Commits
- `feat: add wish card export`
- `fix: rls policy for secrets`
- `chore: update deps`
- `docs: update CLAUDE.md`

### Testing strategy
- **Unit**: Vitest cho utils, business logic
- **Integration**: Supabase RLS tests (critical — phải pass 100%)
- **E2E**: Playwright cho critical flows (signup → create wish → invite partner)
- **Manual**: Mỗi feature test trên 2 devices thật (1 iPhone, 1 Android mid-range)

**Coverage target**: 60% (don't over-test, focus critical paths).

---

## 7. DATABASE SCHEMA (REFERENCE)

> Full schema xem Hidden Gift Brief v2 Section 7. Critical points:

### Multi-tenant root
- `accounts` (couple/squad/family, feature flags built-in)
- `account_members` (user ↔ account, junction table)

### Core entities với RLS critical
- `wishes` — RLS: `user_id = auth.uid()` (partner KHÔNG thấy)
- `secrets` — RLS: `prepared_by = auth.uid()` (recipient KHÔNG thấy)
- `letters` — RLS: sender OR recipient (sau khi sent)
- `memories` — RLS: tất cả account members
- `emoji_pings` — RLS: sender OR recipient

### Performance pattern (CRITICAL)
```sql
-- SLOW: auth.uid() evaluated per row
USING (auth.uid() = user_id)

-- FAST: Wrap in SELECT, cached
USING ((SELECT auth.uid()) = user_id)
```

### Indexes required
- Mọi column dùng trong RLS policies
- Mọi foreign key
- `account_id` (tenant isolation)
- Composite `(account_id, user_id)` cho joins

---

## 8. CODING STANDARDS

### TypeScript
- Strict mode bật (`tsconfig.json`)
- Không `any`, dùng `unknown` nếu cần
- Type generation từ Supabase: `pnpm supabase gen types typescript`
- Naming:
  - `camelCase` cho variables/functions
  - `PascalCase` cho components/types/interfaces
  - `SCREAMING_SNAKE` cho constants
  - `kebab-case` cho file names

### React
- Server Components default, Client Component khi cần interactivity
- `'use client'` directive ở top file khi cần
- Server Actions cho mutations (không API routes nếu có thể)
- `useOptimistic` cho UI tạm thời (emoji ping, wish create)
- Suspense boundaries cho async data

### Supabase
- Server client cho server components/actions
- Browser client CHỈ cho realtime subscriptions
- Luôn handle errors (không assume success)
- RLS test bằng `supabase test db` trước mỗi PR

### Styling
- Tailwind v4 utility-first
- Custom CSS variables trong `globals.css` cho design tokens
- Mobile-first (`sm:`, `md:` overrides)
- Dark mode qua `class` strategy
- Animation: framer-motion cho complex, CSS cho simple

### Performance budgets
- LCP < 2.5s on 3G
- FID < 100ms
- CLS < 0.1
- Bundle size: initial JS < 200KB gzipped
- Image: WebP, lazy load, responsive `srcset`

---

## 9. SECURITY CHECKLIST

Mọi feature mới phải pass:
- [ ] RLS policy enforced ở database level
- [ ] Input validation với Zod (server + client)
- [ ] CSRF protection (built-in Server Actions)
- [ ] Rate limiting với Upstash (login, signup, share features)
- [ ] No sensitive data trong client bundle
- [ ] Cookies: `httpOnly`, `secure`, `sameSite=lax`
- [ ] CORS configured đúng (Vercel handles default)
- [ ] Secrets trong `.env.local`, không commit

### Vietnam PDPL 2026 compliance
- [ ] Granular consent checkboxes ở signup
- [ ] User rights portal (export/delete data) trong Settings
- [ ] Privacy Policy tiếng Việt (hire legal translator trước launch)
- [ ] DPIA template ready để submit (60 ngày sau go-live)
- [ ] Data retention: user delete = 30-day soft delete, sau đó hard delete

---

## 10. CURATED GIFT IDEAS (THAY AI)

> Lý do bỏ AI: chi phí $50-500/tháng không justified cho feature phụ. Curated data team tự build relevance cao hơn AI generic.

### Schema
```sql
CREATE TABLE public.gift_ideas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,                    -- "Vòng tay handmade"
  description TEXT,
  category TEXT NOT NULL,                 -- 'sinh-nhat', 'ky-niem', 'valentine'
  occasion TEXT[],                        -- ['birthday', '100-days', 'anniversary']
  price_min INTEGER,                      -- VND
  price_max INTEGER,
  persona_fit TEXT[],                     -- ['student', 'office-worker', 'long-distance']
  emoji TEXT,                             -- '💍'
  image_url TEXT,                         -- Optional preview
  popularity INTEGER DEFAULT 0,           -- Sort by popularity
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Public read, no RLS needed (static data)
ALTER TABLE public.gift_ideas DISABLE ROW LEVEL SECURITY;
```

### Build plan
- Phase 2: Team build 200 ideas (60% sinh nhật/kỷ niệm, 30% Valentine/lễ, 10% random)
- Categorize theo persona (student budget vs office worker)
- UI filter: occasion + budget + persona
- Sort: popularity (track click-through)

### Future upgrade path
- 5K MAU → reconsider Gemini Flash gated cho Pro tier
- 10K MAU → custom recommendations dựa trên wish history (rule-based, không AI)

---

## 11. VIRAL HOOKS SPEC

### Wish Card Shareable
- **Input**: Wish object (title, description, image)
- **Output**: PNG 1080×1920 (IG Story size)
- **Templates**: 5-7 designs (Dreamy Clouds, Starry Night, Floral Minimal, Neon Pop, Film Grain)
- **Library**: `html-to-image` hoặc Canvas API
- **Watermark**: "Hidden Gift 💝" góc dưới phải, opacity 60%
- **Share**: Web Share API native, fallback copy to clipboard

### Wrapped Recap (Phase 4, deploy tháng 12)
- **Trigger**: Trigger.dev job chạy 1/12 hàng năm
- **Stats**: wishes count, gifts count, letters count, memories count, top badges
- **Format Free**: 10 static slides (screenshot share)
- **Format Pro**: MP4 30-60s với nhạc trending (use Remotion)
- **Hashtag**: #HiddenGiftWrapped2026

### Solo Crush Mode
- **Onboarding split**: "Single" vs "In a relationship"
- **Solo features**: Crush Vault (private notes), countdown, imaginary wish list
- **Conversion CTA**: "Tỏ tình thành công? Mời crush join!" sau 30 ngày
- **Metric**: 20%+ Solo → Couple trong 90 ngày

---

## 12. COMMON COMMANDS

```bash
# Development
pnpm dev                          # Start dev server (Turbopack)
pnpm build                        # Production build
pnpm start                        # Run production locally

# Database
pnpm supabase start               # Local Supabase
pnpm supabase db reset            # Reset local DB
pnpm supabase db push             # Push migrations to remote
pnpm supabase gen types typescript --local > lib/supabase/types.ts

# Testing
pnpm test                         # Vitest unit tests
pnpm test:e2e                     # Playwright E2E
pnpm test:rls                     # Supabase RLS tests

# Code quality
pnpm lint                         # ESLint
pnpm typecheck                    # tsc --noEmit
pnpm format                       # Prettier

# Trigger.dev
pnpm trigger:dev                  # Local Trigger.dev
pnpm trigger:deploy               # Deploy to Trigger.dev cloud

# shadcn/ui
pnpm dlx shadcn@latest add button # Add component
```

---

## 13. CLAUDE CODE SPECIFIC INSTRUCTIONS

### Khi tôi (user) ask Claude Code làm gì, Claude phải:

**1. Đọc context file này trước**
- Hiểu project state hiện tại
- Check phase đang ở đâu
- Verify decision đã chốt (xem Section 2)

**2. Tuân thủ tech stack — KHÔNG đề xuất alternative**
- User chọn Next.js 16, KHÔNG suggest Remix/Astro
- User chọn Supabase, KHÔNG suggest Firebase/PocketBase
- User chọn PayOS, KHÔNG suggest Stripe (cho MVP)
- User bỏ AI, KHÔNG suggest add lại

**3. Code generation priorities**
- Type safety first (no `any`)
- RLS-aware (mọi table query phải pass auth check)
- Mobile-first (Linh dùng iPhone 13)
- Vietnamese UI text
- Performance budget aware

**4. Khi không chắc, hỏi clarification**
- KHÔNG assume requirements không rõ
- Ask trước khi generate code lớn (>100 lines)
- Show plan trước, code sau (cho file lớn)

**5. Reference brief khi cần**
- Hidden Gift Brief v2 là source of truth
- File này (`CLAUDE.md`) là quick reference
- Conflict → hỏi BE Lead (user)

### Comment style
```typescript
// Good: explain WHY, not WHAT
// RLS đảm bảo partner không thấy secret này; auth.uid() wrap trong SELECT để cache
const { data } = await supabase
  .from('secrets')
  .select('*')
  .eq('prepared_by', user.id);

// Bad: redundant
// Select secrets where prepared_by equals user id
```

### File header template
```typescript
/**
 * @file wishes/actions.ts
 * @description Server Actions cho wish CRUD. RLS: user_id = auth.uid()
 * @phase 1 (Couple Core)
 * @persona Linh & Dũng (P1)
 */
```

---

## 14. DEBUGGING GUIDE

### "RLS policy violation" error
1. Check `auth.uid()` có trả null không (user chưa login)
2. Test policy bằng `SET request.jwt.claims = '{"sub": "user-uuid"}';`
3. Verify policy expression đúng (USING vs WITH CHECK)
4. Check index có cover query không

### Supabase Realtime không nhận event
1. Check Realtime enabled trên table (`ALTER PUBLICATION supabase_realtime ADD TABLE...`)
2. Check channel name match
3. Check filter match (RLS apply cho Realtime too)
4. Browser DevTools → Network → WS connection alive

### Trigger.dev job không chạy
1. Check Trigger.dev dashboard có nhận event không
2. Verify cron expression đúng timezone (Asia/Ho_Chi_Minh)
3. Check API key trong `.env.local`
4. Local: `pnpm trigger:dev` đang chạy không

### PayOS webhook không verify
1. Check `x-payos-signature` header
2. Verify checksum key đúng
3. Check raw body (không JSON.parse trước verify)
4. Localhost: dùng ngrok hoặc Vercel preview URL

---

## 15. METRICS & KPIs

### North Star Metric
**Weekly Active Couples** (WAC) — đo cả 2 partner đều active trong tuần.

### Phase metrics

**Phase 1 (post-launch)**:
- 100 signups
- 30% finish onboarding (link partner)
- 50% retention day 7

**Phase 2**:
- 1K MAU
- 10%+ users share Wish Card
- 20%+ Solo users convert to Couple

**Phase 3 (post-Pro launch)**:
- 5K MAU
- 2-4% Free → Pro conversion
- Churn < 5%/month

### Funnel critical
```
Signup → Verify Email → Onboarding → Link Partner → First Wish → First Letter → Pro Trial → Pro Paid
```

Track mọi step trong PostHog. Drop-off >40% bất kỳ step = bug.

---

## 16. EMERGENCY CONTACTS / KNOWLEDGE

### Khi Claude Code stuck
1. Check official docs:
   - Next.js 16: https://nextjs.org/docs
   - Supabase: https://supabase.com/docs
   - shadcn/ui: https://ui.shadcn.com
   - Better-Auth: https://better-auth.com/docs
   - PayOS: https://payos.vn/docs
2. Check Hidden Gift Brief v2 (source of truth)
3. Ask BE Lead (user) cho business logic decisions

### Critical files Claude phải biết
- `CLAUDE.md` — this file (project context)
- `Hidden-Gift-Brief.md` — full spec
- `supabase/migrations/` — schema source of truth
- `.env.example` — required env vars
- `package.json` — dependencies + scripts

---

## 17. CHANGELOG

| Date | Version | Changes |
|------|---------|---------|
| 2026-05-18 | 1.0 | Initial blueprint based on Brief v2 |

---

## 18. APPENDIX — SAMPLE PROMPTS CHO CLAUDE CODE

Examples cách dùng Claude Code hiệu quả cho project này:

### Good prompt examples

"Tạo Server Action `createWish` trong `app/(app)/wishes/actions.ts`. Validate input bằng Zod (title required, max 100 chars; description optional, max 500). RLS đã enforce ở DB. Throw error nếu reach free tier limit (>5 active wishes)."

"Build component `WishCardExport` trong `components/wishes/`. Input: Wish object. Output: PNG download. Dùng `html-to-image`. Template: pastel gradient (P1 Linh aesthetic). Watermark "Hidden Gift" bottom-right opacity 60%."

"Migration mới: thêm column `popularity INTEGER DEFAULT 0` vào `gift_ideas`. Update RLS: bỏ vì public table. Backfill data bằng seed script."

### Bad prompt examples (avoid)

"Code app couple đi" — quá vague, no context
"Add AI suggestion feature" — vi phạm Decision 1 (bỏ AI)
"Use Stripe for payment" — vi phạm Decision 4 (chỉ PayOS)
"Build Family mode UI" — Phase 5, không phải MVP

---

**END OF CLAUDE.md**

> Last updated: May 18, 2026 by BE Lead (100B Studio)
> Next review: After Phase 1 completion
