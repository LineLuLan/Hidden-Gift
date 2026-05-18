# Setup Guide — Service Registration

> Hướng dẫn đăng ký từng external service. Đăng ký theo tier — tier 1 cần ngay cho Phase 0/1, tier 4 defer tới Phase 3.

**Last updated**: 2026-05-18

---

## Quickstart

```bash
git clone https://github.com/LineLuLan/Hidden-Gift.git
cd Hidden-Gift
cp .env.example .env.local
pnpm i
pnpm dev
```

`.env.local` cần điền các keys từ services dưới đây.

---

## Tier 1 — Phase 0 (đăng ký TRƯỚC khi scaffold Phase 0 features)

### 1. Supabase

- **URL**: https://supabase.com
- **Region**: Singapore (`ap-southeast-1`) — gần Việt Nam nhất
- **Plan**: Free tier (500MB DB, 1GB storage, 50K MAU) — đủ cho Phase 0-2
- **Steps**:
  1. Sign up bằng GitHub
  2. New Project -> chọn Singapore region -> password mạnh (lưu vào password manager)
  3. Project Settings -> API -> copy:
     - `Project URL` -> `NEXT_PUBLIC_SUPABASE_URL`
     - `anon public` key -> `NEXT_PUBLIC_SUPABASE_ANON_KEY`
     - `service_role` key -> `SUPABASE_SERVICE_ROLE_KEY` (server-only, không expose)
  4. Project Settings -> General -> copy `Reference ID` -> `SUPABASE_PROJECT_REF`
  5. Database password -> `SUPABASE_DB_PASSWORD`
- **Time**: 5 phút

### 2. Google Cloud Console (OAuth credentials)

- **URL**: https://console.cloud.google.com
- **Plan**: Free (OAuth không tính phí)
- **Steps**:
  1. New Project: "Hidden Gift"
  2. APIs & Services -> OAuth consent screen -> External -> fill app name, email, support
  3. Credentials -> Create Credentials -> OAuth client ID -> Web Application
  4. Authorized redirect URIs:
     - `http://localhost:3000/api/auth/callback/google` (dev)
     - `https://your-vercel-domain.vercel.app/api/auth/callback/google` (prod, fill sau)
  5. Copy `Client ID` -> `GOOGLE_CLIENT_ID`
  6. Copy `Client Secret` -> `GOOGLE_CLIENT_SECRET`
- **Time**: 10 phút

### 3. Vercel

- **URL**: https://vercel.com
- **Plan**: Hobby (free) cho dev, Pro $20/mo cho prod (theo CLAUDE.md §3)
- **Steps**:
  1. Sign up bằng GitHub
  2. Add New Project -> import `Hidden-Gift` repo
  3. Framework Preset: Next.js (auto-detect)
  4. Environment Variables: paste từ `.env.local`
  5. Deploy
  6. Settings -> Git -> Production Branch: `main`; Preview branches: `dev`
- **Time**: 10 phút

### 4. Cloudflare (R2 storage)

- **URL**: https://dash.cloudflare.com
- **Plan**: Free tier (10GB storage, $0 egress)
- **Steps**:
  1. Sign up
  2. R2 -> Create bucket "hidden-gift-memories"
  3. R2 -> Manage R2 API Tokens -> Create API Token -> Object Read & Write
  4. Copy `Account ID` -> `CLOUDFLARE_ACCOUNT_ID`
  5. Copy `Access Key ID` -> `R2_ACCESS_KEY_ID`
  6. Copy `Secret Access Key` -> `R2_SECRET_ACCESS_KEY`
  7. Bucket name -> `R2_BUCKET_NAME=hidden-gift-memories`
  8. Public URL (R2 -> bucket -> Settings -> Public access) -> `R2_PUBLIC_URL`
- **Time**: 15 phút

---

## Tier 2 — Phase 1 features

### 5. Trigger.dev v3

- **URL**: https://trigger.dev
- **Plan**: Free (100K runs/mo, đủ MVP)
- **Steps**:
  1. Sign up bằng GitHub
  2. New Project: "Hidden Gift"
  3. Settings -> API Keys -> copy `dev` secret key -> `TRIGGER_SECRET_KEY`
  4. Project ID -> `TRIGGER_PROJECT_ID`
- **Time**: 5 phút
- **Local dev**: `pnpm trigger:dev` chạy local trước khi deploy

### 6. Resend (transactional emails)

- **URL**: https://resend.com
- **Plan**: Free (3K emails/mo, 100/day) -> Pro $20/mo khi launch
- **Steps**:
  1. Sign up
  2. Verify domain (cần DNS access — Cloudflare DNS hoặc Namecheap)
  3. API Keys -> Create -> copy -> `RESEND_API_KEY`
  4. Set `RESEND_FROM_EMAIL=hello@yourdomain.com` (sau khi verify domain)
- **Time**: 30 phút (DNS verification chờ propagation)
- **Lưu ý**: Trước khi có domain, dùng `onboarding@resend.dev` cho dev testing

### 7. Upstash (Redis)

- **URL**: https://upstash.com
- **Plan**: Free (10K commands/day, 256MB)
- **Steps**:
  1. Sign up bằng GitHub
  2. Create Database -> Region: Singapore -> Type: Regional (TLS enabled)
  3. Copy `UPSTASH_REDIS_REST_URL`
  4. Copy `UPSTASH_REDIS_REST_TOKEN`
- **Time**: 5 phút

---

## Tier 3 — Phase 2+ (Observability)

### 8. PostHog (analytics + feature flags)

- **URL**: https://posthog.com
- **Plan**: Free (1M events/mo)
- **Steps**:
  1. Sign up
  2. Project: "Hidden Gift"
  3. Settings -> Project API Key -> `NEXT_PUBLIC_POSTHOG_KEY`
  4. `NEXT_PUBLIC_POSTHOG_HOST=https://us.i.posthog.com` (hoặc EU host)
- **Time**: 5 phút

### 9. Sentry (error tracking)

- **URL**: https://sentry.io
- **Plan**: Developer free (5K errors/mo)
- **Steps**:
  1. Sign up
  2. Create Project: Platform "Next.js" -> "Hidden Gift"
  3. Copy `DSN` -> `SENTRY_DSN`
  4. Settings -> Auth Tokens -> Create -> `SENTRY_AUTH_TOKEN`
  5. `SENTRY_ORG=your-org-slug`
  6. `SENTRY_PROJECT=hidden-gift`
- **Time**: 10 phút

### 10. Plausible (marketing site analytics)

- **URL**: https://plausible.io
- **Plan**: $9/mo Starter (10K pageviews) — cho marketing site `(marketing)` route
- **Steps**:
  1. Sign up
  2. Add Site: `hiddengift.vn` (hoặc domain final)
  3. `NEXT_PUBLIC_PLAUSIBLE_DOMAIN=hiddengift.vn`
- **Time**: 5 phút
- **Defer**: có thể đăng ký sau khi có domain.

---

## Tier 4 — Phase 3 (Monetization)

### 11. PayOS

- **URL**: https://payos.vn
- **Plan**: 0% fees (theo Brief §10)
- **Required**: business document (giấy phép kinh doanh) -- không phải individual
- **Steps**:
  1. Đăng ký business account
  2. KYC verification (1-3 ngày)
  3. Dashboard -> Integration -> copy:
     - `PAYOS_CLIENT_ID`
     - `PAYOS_API_KEY`
     - `PAYOS_CHECKSUM_KEY`
  4. Webhook URL: `https://yourdomain.com/api/webhooks/payos`
- **Time**: 1-3 ngày (KYC)
- **Defer**: đăng ký khi sắp Phase 3 launch, không cần Phase 0-2.

---

## Local Dev Tools (không cần đăng ký online)

### Supabase CLI

```bash
pnpm add -g supabase
supabase login
supabase init  # khởi tạo supabase/ folder
supabase start # chạy local Postgres + Studio
```

### Trigger.dev CLI

```bash
pnpm dlx trigger.dev@latest init
pnpm trigger:dev  # local dev server
```

---

## Verification Checklist

Sau khi đăng ký xong, verify:

- [ ] `.env.local` có >= 25 keys filled (Tier 1+2 tối thiểu cho Phase 1)
- [ ] `pnpm dev` chạy được, không lỗi env var missing
- [ ] Supabase connection test: `pnpm supabase status` shows local + remote OK
- [ ] Google OAuth dev redirect work: thử `http://localhost:3000/api/auth/signin/google`
- [ ] Vercel preview deploy success
- [ ] Cloudflare R2 bucket accessible từ Node SDK (test script)
- [ ] Trigger.dev dashboard shows runs khi local dev fire event
- [ ] Resend test email gửi tới mailbox cá nhân
- [ ] Upstash Redis ping OK từ Node
- [ ] PostHog event capture trên dev
- [ ] Sentry test error xuất hiện trong dashboard

---

## Total cost monthly (estimate Phase 0-2, 0-5K MAU)

| Service | Cost |
|---------|------|
| Supabase | $0 (free tier) |
| Vercel | $0 dev, $20 Pro production |
| Cloudflare R2 | $0 (free tier) |
| Resend | $0 (free tier) -> $20 sau khi launch |
| Trigger.dev | $0 (free tier) |
| Upstash | $0 (free tier) |
| PostHog | $0 (free tier) |
| Sentry | $0 (developer free) |
| Plausible | $9/mo (defer post-launch) |
| **TOTAL Phase 0-1** | **$0** |
| **TOTAL Phase 2 launch** | **~$50/mo** |
