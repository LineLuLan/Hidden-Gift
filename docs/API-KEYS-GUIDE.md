# API Keys Guide — Hướng dẫn lấy tất cả keys (9 services)

> **Mục đích**: User-facing guide để BE Lead tự đăng ký 9 external services và điền vào `.env.local`. Code đã wired graceful skip — service nào chưa có key, feature đó disable nhưng app vẫn chạy.

**Last updated**: 2026-05-19
**Maintainer**: BE Lead

---

## Trạng thái tổng quan

| #   | Service            | Required?            | Phase | Status     |
| --- | ------------------ | -------------------- | ----- | ---------- |
| 1   | Supabase           | **BẮT BUỘC**         | 0     | ✅ done    |
| 2   | Google Cloud OAuth | Optional             | 1     | ⬜ pending |
| 3   | Vercel             | Khi deploy           | 0     | ⬜ pending |
| 4   | Cloudflare R2      | Khi upload memories  | 1     | ⬜ pending |
| 5   | Trigger.dev        | Khi schedule letters | 1     | ⬜ pending |
| 6   | Upstash Redis      | Khi cần rate limit   | 1     | ⬜ pending |
| 7   | Resend             | Khi gửi email        | 1     | ⬜ pending |
| 8   | PostHog            | Khi launch           | 2     | ⬜ pending |
| 9   | Sentry             | Khi launch           | 2     | ⬜ pending |

**Quan trọng:**

- Chỉ **Supabase** là bắt buộc trước khi dev local (DB + auth backend).
- 8 service còn lại đều có **graceful skip** — code check `process.env`, nếu missing thì feature đó disable, KHÔNG crash app.
- Đăng ký order khuyến nghị: theo bảng (top-down), nhưng thứ tự không strict.

---

## 1. Supabase ✅ (đã xong)

### Lấy keys ở đâu

- URL: https://supabase.com
- Region: **Southeast Asia (Singapore — `ap-southeast-1`)** — bắt buộc
- Plan: **Free** ($0/mo, 500MB DB, 50K MAU)

### Steps

1. Sign up bằng GitHub
2. New Organization → tên "100B Studio" (hoặc gì cũng được)
3. New Project:
   - Name: `hidden-gift`
   - Database Password: **mạnh** (16+ ký tự), lưu password manager
   - Region: **Singapore**
   - Pricing: Free
4. Đợi 1-2' để provision DB
5. **Project Settings → API**: copy 3 key
6. **Project Settings → General**: copy Reference ID

### Map vào `.env.local`

| Supabase dashboard                    | →   | `.env.local` key                |
| ------------------------------------- | --- | ------------------------------- |
| Settings → API → **Project URL**      | →   | `NEXT_PUBLIC_SUPABASE_URL`      |
| Settings → API → **anon public**      | →   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` |
| Settings → API → **service_role**     | →   | `SUPABASE_SERVICE_ROLE_KEY`     |
| Settings → General → **Reference ID** | →   | `SUPABASE_PROJECT_REF`          |
| Password tự đặt khi tạo project       | →   | `SUPABASE_DB_PASSWORD`          |

### ⚠️ Lưu ý

- `service_role` key **chỉ server-side**, không bao giờ expose ra browser. Lỡ commit → Reset trong dashboard ngay.
- DB password không thể recover, chỉ reset (down DB ~1 phút).

---

## 2. Google Cloud OAuth ⬜

### Mục đích

Login Google qua Better-Auth. Nếu chưa có keys → trang login chỉ hiện form email/password, ẩn nút "Continue with Google".

### Lấy keys ở đâu

- URL: https://console.cloud.google.com
- Plan: **Free** (OAuth không tính phí)

### Steps

1. Sign in Google account → đồng ý ToS
2. **New Project**: bar trên cùng → project dropdown → **New Project**
   - Name: `Hidden Gift`
   - Organization: No organization
3. **OAuth consent screen** (PHẢI làm trước khi tạo credentials):
   - Sidebar: **APIs & Services** → **OAuth consent screen**
   - User Type: **External** → Create
   - App information:
     - App name: `Hidden Gift`
     - User support email: email của bạn
     - Developer contact: email của bạn
     - Authorized domains: bỏ trống
   - Scopes: skip (default email/profile/openid đủ)
   - Test users: add email team (Test mode chỉ email trong list mới login được)
4. **Create OAuth Client ID**:
   - Sidebar: **APIs & Services** → **Credentials**
   - **+ Create Credentials** → **OAuth client ID**
   - Application type: **Web application**
   - Name: `Hidden Gift Web (Dev)`
   - Authorized JavaScript origins: `http://localhost:3000`
   - Authorized redirect URIs: `http://localhost:3000/api/auth/callback/google`
   - Create → popup hiện Client ID + Client Secret
5. Copy 2 giá trị

### Map vào `.env.local`

| Google Cloud                     | →   | `.env.local` key       |
| -------------------------------- | --- | ---------------------- |
| OAuth Client → **Client ID**     | →   | `GOOGLE_CLIENT_ID`     |
| OAuth Client → **Client Secret** | →   | `GOOGLE_CLIENT_SECRET` |

### ⚠️ Lưu ý

- Redirect URI phải **chính xác** từng dấu `/`, không trailing slash thừa.
- Sau khi deploy Vercel: quay lại add thêm `https://<vercel-domain>.vercel.app/api/auth/callback/google`.
- Trước launch (Phase 2): phải **Publish** consent screen (cần verify domain + privacy policy).
- Reset Secret bất cứ lúc nào nếu lộ.

---

## 3. Vercel ⬜

### Mục đích

Hosting Next.js + preview deploys cho mỗi PR. Không có "key" đặc biệt — Vercel tự link GitHub repo.

### Steps

1. Sign up https://vercel.com bằng GitHub
2. **Add New Project** → import `LineLuLan/Hidden-Gift`
3. Framework Preset: **Next.js** (auto-detect)
4. **Environment Variables**: copy paste tất cả từ `.env.local` (Vercel có nút "paste .env")
5. Deploy
6. **Settings → Git**:
   - Production Branch: `main`
   - Preview Branches: tất cả (mặc định)

### Map vào `.env.local`

Không cần. Vercel tự inject env vars vào runtime.

### ⚠️ Lưu ý

- Sau khi có preview URL: cập nhật `BETTER_AUTH_URL` cho production = URL Vercel.
- Cập nhật Google OAuth redirect URI với Vercel domain.
- Plan: Hobby free đủ dev/staging; Pro $20/mo cho production traffic.

---

## 4. Cloudflare R2 ⬜

### Mục đích

Lưu memories (ảnh/video). $0 egress (free tier 10GB/mo) — rẻ hơn S3 nhiều cho VN traffic.

**Graceful skip**: nếu thiếu key, code Memories sẽ dùng local filesystem fallback (lưu vào `.local-uploads/`), warning log.

### Steps

1. Sign up https://dash.cloudflare.com
2. Sidebar: **R2 Object Storage** → enable (cần verify email + add payment method, không charge nếu trong free tier)
3. **Create bucket** → name: `hidden-gift-memories` → location: Asia-Pacific
4. **Manage R2 API Tokens** → Create API Token:
   - Permissions: **Object Read & Write**
   - TTL: forever
   - Specify bucket: `hidden-gift-memories`
5. Copy Access Key ID + Secret Access Key
6. Bucket → **Settings** → **Public access** → enable → copy Public URL
7. Account ID: ở sidebar phải dashboard chính, dạng `abc123def...`

### Map vào `.env.local`

| Cloudflare                           | →   | `.env.local` key               |
| ------------------------------------ | --- | ------------------------------ |
| Dashboard sidebar → **Account ID**   | →   | `CLOUDFLARE_ACCOUNT_ID`        |
| R2 API Token → **Access Key ID**     | →   | `R2_ACCESS_KEY_ID`             |
| R2 API Token → **Secret Access Key** | →   | `R2_SECRET_ACCESS_KEY`         |
| Bucket name                          | →   | `R2_BUCKET_NAME` (đã pre-fill) |
| Bucket → Settings → **Public URL**   | →   | `R2_PUBLIC_URL`                |

### ⚠️ Lưu ý

- Public URL chỉ enable cho bucket memories, không expose bucket khác.
- Secret Key chỉ show 1 lần khi tạo — copy ngay.

---

## 5. Trigger.dev ⬜

### Mục đích

Scheduled jobs: letter delivery (cron), renewal reminders, year-end Wrapped.

**Graceful skip**: nếu thiếu key, letters vẫn save được vào DB, nhưng không trigger delivery job. UI hiển thị warning "Letter scheduling tạm tắt".

### Steps

1. Sign up https://trigger.dev bằng GitHub
2. **New Project** → name: `Hidden Gift`
3. **Settings → API Keys**:
   - Copy `dev` secret key (dạng `tr_dev_...`)
4. **Settings → Project**:
   - Copy Project ID (dạng `proj_xxx`)

### Map vào `.env.local`

| Trigger.dev                          | →   | `.env.local` key     |
| ------------------------------------ | --- | -------------------- |
| Settings → API Keys → **dev secret** | →   | `TRIGGER_SECRET_KEY` |
| Settings → Project → **Project ID**  | →   | `TRIGGER_PROJECT_ID` |

### ⚠️ Lưu ý

- Local dev: chạy `pnpm trigger:dev` parallel với `pnpm dev`.
- Dev key chỉ dùng local. Prod cần generate riêng `prod` secret.

---

## 6. Upstash Redis ⬜

### Mục đích

Rate limiting (login, signup, share features), session cache, ephemeral data.

**Graceful skip**: nếu thiếu, rate limit dùng in-memory fallback (per-instance, không chính xác với multi-instance). Dev OK, prod cần Upstash.

### Steps

1. Sign up https://upstash.com bằng GitHub
2. **Redis → Create Database**:
   - Name: `hidden-gift`
   - Type: **Regional**
   - Region: **Asia-Pacific (Singapore)**
   - TLS: **Enabled**
   - Eviction: enable LRU
3. Copy 2 giá trị từ tab **REST API**:
   - `UPSTASH_REDIS_REST_URL`
   - `UPSTASH_REDIS_REST_TOKEN`

### Map vào `.env.local`

| Upstash                         | →   | `.env.local` key           |
| ------------------------------- | --- | -------------------------- |
| Database → REST API → **URL**   | →   | `UPSTASH_REDIS_REST_URL`   |
| Database → REST API → **Token** | →   | `UPSTASH_REDIS_REST_TOKEN` |

### ⚠️ Lưu ý

- Phải dùng **REST API** keys (không phải connection string).
- Free tier 10K commands/day — đủ MVP. Theo dõi usage.

---

## 7. Resend ⬜

### Mục đích

Transactional email: verify signup, letter delivery notification, partner invite, password reset.

**Graceful skip**: nếu thiếu key, code log email content ra console thay vì gửi thật. Dev OK, không có email thật.

### Steps

1. Sign up https://resend.com
2. **API Keys → Create API Key**:
   - Name: `hidden-gift-dev`
   - Permission: Sending access
   - Domain: All domains
3. Copy key (dạng `re_xxx`) — chỉ show 1 lần
4. **Domain setup** (defer tới khi có domain final):
   - Dev: dùng sender `onboarding@resend.dev` (không cần verify)
   - Prod: add domain → verify DNS records → set sender `hello@yourdomain.com`

### Map vào `.env.local`

| Resend                   | →   | `.env.local` key                                      |
| ------------------------ | --- | ----------------------------------------------------- |
| API Keys → **Key value** | →   | `RESEND_API_KEY`                                      |
| Sender email             | →   | `RESEND_FROM_EMAIL` (default `onboarding@resend.dev`) |

### ⚠️ Lưu ý

- Free tier: 3K emails/mo, 100/day, sender `@resend.dev` only.
- Prod cần verify domain DNS — Cloudflare DNS hoặc Namecheap (~30 phút propagation).

---

## 8. PostHog ⬜

### Mục đích

Analytics events, funnels, feature flags. Track Linh & Dũng từ signup → first wish → first letter → conversion Pro.

**Graceful skip**: nếu thiếu key, không track event. App run bình thường.

### Steps

1. Sign up https://posthog.com (chọn **US Cloud** — nhanh hơn cho VN)
2. **New Project**: `Hidden Gift`
3. **Project Settings → Project API Key**: copy (dạng `phc_xxx`)
4. Host: `https://us.i.posthog.com` (đã pre-fill trong `.env.local`)

### Map vào `.env.local`

| PostHog                                | →   | `.env.local` key           |
| -------------------------------------- | --- | -------------------------- |
| Project Settings → **Project API Key** | →   | `NEXT_PUBLIC_POSTHOG_KEY`  |
| (đã pre-fill)                          | →   | `NEXT_PUBLIC_POSTHOG_HOST` |

### ⚠️ Lưu ý

- Free tier: 1M events/mo, đủ cho 5K MAU.
- Project API Key public OK (browser dùng được).

---

## 9. Sentry ⬜

### Mục đích

Error tracking client + server, source maps, performance traces.

**Graceful skip**: nếu thiếu key, errors chỉ log ra console. App run bình thường.

### Steps

1. Sign up https://sentry.io
2. **Create Project**:
   - Platform: **Next.js**
   - Project name: `hidden-gift`
   - Team: default
3. Copy **DSN** (dạng `https://abc@xyz.ingest.sentry.io/123`)
4. **Settings → Auth Tokens → Create Token**:
   - Scopes: `project:read`, `project:releases`, `org:read`
   - Copy token (dạng `sntrys_xxx`)
5. Note `Organization slug` (URL Sentry dạng `https://sentry.io/organizations/<slug>/`)

### Map vào `.env.local`

| Sentry                             | →   | `.env.local` key    |
| ---------------------------------- | --- | ------------------- |
| Project → **DSN**                  | →   | `SENTRY_DSN`        |
| Settings → Auth Tokens → **Token** | →   | `SENTRY_AUTH_TOKEN` |
| URL slug                           | →   | `SENTRY_ORG`        |
| (đã pre-fill)                      | →   | `SENTRY_PROJECT`    |

### ⚠️ Lưu ý

- Free tier: 5K errors/mo.
- Auth Token cần để upload source maps khi build.
- DSN public OK.

---

## DEFER — đăng ký sau

### Plausible (marketing analytics)

- $9/mo Starter tier, dùng cho marketing site `(marketing)` route
- Đăng ký khi đã có domain final `hiddengift.vn`
- Key: `NEXT_PUBLIC_PLAUSIBLE_DOMAIN`

### PayOS (Phase 3 — monetization)

- Yêu cầu giấy phép kinh doanh + KYC 1-3 ngày
- 0% transaction fee
- Chỉ cần khi launch Pro tier (sau 200+ active couples)
- Keys: `PAYOS_CLIENT_ID`, `PAYOS_API_KEY`, `PAYOS_CHECKSUM_KEY`

---

## Quote trong `.env.local` — cần hay không?

| Value chứa                    | Quote `""`?               |
| ----------------------------- | ------------------------- |
| Chỉ chữ + số + `-_.:/=`       | **KHÔNG**                 |
| Có space, `#`, `$`, backslash | **CÓ**                    |
| Không chắc                    | Cứ quote `""` cho an toàn |

JWT (`eyJ...`), URL HTTPS, alphanumeric → không cần quote.
DB password có ký tự đặc biệt → quote.

---

## Sau khi điền xong từng service

Báo Claude trong chat: "Done service X" → Claude verify connection + đánh dấu task completed.

Hoặc tự verify bằng script smoke test:

```bash
# Supabase: chạy đã verified
# Google OAuth: mở http://localhost:3000/api/auth/signin/google
# R2: pnpm tsx scripts/test-r2.ts (sẽ có sau)
# Trigger.dev: pnpm trigger:dev (terminal hiện "Connected")
# Resend: pnpm tsx scripts/test-email.ts hello@yourdomain.com
# Upstash: pnpm tsx scripts/test-redis.ts
# PostHog: dev browser → emit event → check Live Events
# Sentry: throw Error('test') trong dev → check Issues
```

---

## Tổng chi phí monthly

| Service       | Phase 0-2 (0-5K MAU)   | Phase 3 (5K+ MAU) |
| ------------- | ---------------------- | ----------------- |
| Supabase      | $0 (free tier)         | $25 (Pro)         |
| Vercel        | $0 (Hobby) → $20 (Pro) | $20               |
| Cloudflare R2 | $0                     | $0 (free egress)  |
| Resend        | $0 (free)              | $20 (Pro)         |
| Trigger.dev   | $0                     | $0                |
| Upstash       | $0                     | $0 (free tier)    |
| PostHog       | $0 (1M events)         | $0                |
| Sentry        | $0 (5K errors)         | $26 (Team)        |
| Plausible     | $0 (defer)             | $9                |
| **TOTAL**     | **~$20/mo**            | **~$100/mo**      |
