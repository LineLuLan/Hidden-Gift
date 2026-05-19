# Deploy Guide — Hidden Gift

> Production deployment to Vercel + Supabase. Phase 3 readiness checklist.

**Last updated**: 2026-05-19

---

## Pre-deploy checklist

- [ ] All env keys in `.env.local` work locally (`pnpm dev` clean boot)
- [ ] 12 migrations applied to **production** Supabase project (separate from dev)
- [ ] Custom domain DNS configured (CNAME → Vercel)
- [ ] Google OAuth `Authorized redirect URIs` includes production URL
- [ ] Resend domain verified (DNS records propagated)
- [ ] PostHog project created, key copied
- [ ] Sentry project created, DSN copied
- [ ] R2 bucket created (if swapping from Supabase Storage)
- [ ] Trigger.dev project linked (`pnpm trigger:deploy`)
- [ ] PDPL 2026 Privacy Policy reviewed by legal

---

## Step 1 — Vercel project

```bash
# From local repo
pnpm dlx vercel link
pnpm dlx vercel
```

Or via dashboard: https://vercel.com/new → Import `LineLuLan/Hidden-Gift`.

Framework: **Next.js** (auto-detected from `vercel.json`).
Region: **sin1** (Singapore — closest to VN traffic, set in `vercel.json`).

### Branch strategy

| Branch      | Vercel deployment | URL                                |
| ----------- | ----------------- | ---------------------------------- |
| `main`      | Production        | `hiddengift.vn` (or `.vercel.app`) |
| `dev`       | Preview           | `hidden-gift-dev.vercel.app`       |
| `be` / `fe` | Preview (auto)    | `hidden-gift-<sha>.vercel.app`     |

---

## Step 2 — Environment variables

Paste from `.env.local` minus the comments. Or use Vercel CLI:

```bash
vercel env pull .env.production.local  # download production
vercel env add SUPABASE_SERVICE_ROLE_KEY production
# ... repeat for each
```

**Required for production:**

```
NEXT_PUBLIC_APP_URL=https://hiddengift.vn
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
SUPABASE_PROJECT_REF=...
SUPABASE_DB_PASSWORD=...
BETTER_AUTH_SECRET=<rotated, NOT same as dev>
BETTER_AUTH_URL=https://hiddengift.vn
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
```

**Recommended for production:**

```
SENTRY_DSN=...
SENTRY_ORG=...
SENTRY_AUTH_TOKEN=...
NEXT_PUBLIC_POSTHOG_KEY=...
UPSTASH_REDIS_REST_URL=...
UPSTASH_REDIS_REST_TOKEN=...
RESEND_API_KEY=...
RESEND_FROM_EMAIL=hello@hiddengift.vn
```

**For Phase 3 (Pro tier launch):**

```
PAYOS_CLIENT_ID=...
PAYOS_API_KEY=...
PAYOS_CHECKSUM_KEY=...
```

**Optional R2 swap (cheaper memories at scale):**

```
CLOUDFLARE_ACCOUNT_ID=...
R2_ACCESS_KEY_ID=...
R2_SECRET_ACCESS_KEY=...
R2_BUCKET_NAME=hidden-gift-memories
R2_PUBLIC_URL=https://media.hiddengift.vn
```

---

## Step 3 — Supabase Auth redirect URLs

Dashboard → Authentication → URL Configuration → Add:

- `https://hiddengift.vn/auth/callback`
- `https://hidden-gift-dev.vercel.app/auth/callback` (preview)

---

## Step 4 — Google OAuth redirect URLs

Google Cloud Console → Credentials → OAuth client → Authorized redirect URIs:

- `https://hiddengift.vn/auth/callback`
- `https://hidden-gift-dev.vercel.app/auth/callback`

---

## Step 5 — Trigger.dev deploy

```bash
pnpm trigger:deploy
```

Verify in Trigger.dev dashboard that `deliver-scheduled-letters` cron is active.

---

## Step 6 — Resend domain

1. Resend → Domains → Add `hiddengift.vn`
2. Set DNS records (SPF, DKIM, DMARC) in Cloudflare
3. Wait for verification (~30 min)
4. Update `RESEND_FROM_EMAIL=hello@hiddengift.vn`

---

## Step 7 — Smoke test production

After first deploy:

1. Visit `https://hiddengift.vn/welcome` — landing renders
2. `/signup` → tạo tài khoản → email arrives from `hello@hiddengift.vn`
3. Verify email → redirect into dashboard
4. Onboarding wizard → pick mode → save
5. Create wish → smoke OK
6. Generate invite + accept from second browser
7. Letter compose → schedule 5 minutes out → Trigger.dev cron delivers + email lands

---

## Rollback

- Vercel: Dashboard → Deployments → previous production → Promote
- Supabase migrations: `supabase migration repair` then `db reset` (DESTRUCTIVE — only with backup)

---

## Cost forecast (Phase 2-3 launch)

| Service                    | Tier                      | Monthly   |
| -------------------------- | ------------------------- | --------- |
| Vercel Pro                 | required for prod traffic | $20       |
| Supabase                   | Free → Pro at 5K MAU      | $0 → $25  |
| Cloudflare R2              | Free 10GB egress          | $0        |
| Resend                     | Free 3K → Pro at 1K MAU   | $0 → $20  |
| Trigger.dev                | Free 100K runs/mo         | $0        |
| Upstash                    | Free 10K commands/day     | $0        |
| PostHog                    | Free 1M events/mo         | $0        |
| Sentry                     | Free 5K errors/mo → Team  | $0 → $26  |
| **Phase 2** (0-1K MAU)     |                           | **$20**   |
| **Phase 3** (5K MAU + Pro) |                           | **~$110** |

Pro tier revenue (assume 3% conversion @ 5K MAU × 29k VND): ~4.3M VND/mo ≈ $170/mo. Break-even ~3K MAU.
