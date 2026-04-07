# Go-live checklist (production)

Use this when moving QueueCut / TrimTime from local demo to a live environment. It lists **what to configure**, **which files contain demo or static behavior**, and **what you should change or harden** for real users.

---

## 1. Environment variables (primary lever)

Copy from `.env.example` into your **production** secrets store (not committed). At minimum, review and set:

| Area | Variables (examples) | Notes |
|------|----------------------|--------|
| **Runtime** | `NODE_ENV=production` | Disables demo OTP defaults, hides OTP in API responses, tightens GraphQL errors. |
| **API** | `APP_PORT`, `APP_URL` | Match your reverse proxy / load balancer. |
| **CORS** | `FRONTEND_URL` | Comma-separated **exact** origins (scheme + host + port), e.g. `https://admin.example.com,https://app.example.com`. If unset, API falls back to localhost origins only (wrong for production). |
| **Mobile / QR** | `MOBILE_URL` | Public base URL of the customer app; used when seeding QR `targetUrl` values (`prisma/seed.ts`). Set before running seed in any long-lived environment. |
| **Database** | `DATABASE_URL` | Production Postgres; never use dev credentials. |
| **Redis** | `REDIS_URL` | Production Redis (OTP storage, locks, refresh tokens). |
| **JWT** | `JWT_SECRET`, `JWT_REFRESH_SECRET`, expiries | Strong random values; rotate if compromised. |
| **OTP / SMS** | Remove reliance on `DEV_STATIC_OTP` | In production it is **ignored**. Implement SMS (e.g. Twilio) in `apps/api/src/modules/auth/auth.service.ts` where the Twilio `TODO` is today. |
| **GraphQL** | `GRAPHQL_PLAYGROUND`, `GRAPHQL_INTROSPECTION` | Set to `false` in production unless you explicitly need them behind auth. See `apps/api/src/config/graphql.config.ts`. |

**OTP behavior summary**

- **Non-production:** If `DEV_STATIC_OTP` is **unset**, the API defaults to demo code `123456`. Empty `DEV_STATIC_OTP=` means random OTP (still echoed in responses when not production).
- **Production:** Always random server-side OTP; wire your SMS provider and **never** return OTP in GraphQL responses (current code already omits `otp` when `NODE_ENV=production`).

---

## 2. Files you typically change for go-live

### 2.1 API (NestJS)

| File | What to do |
|------|------------|
| `apps/api/src/main.ts` | Ensure `FRONTEND_URL` includes all production web origins; do not rely on localhost defaults in prod. |
| `apps/api/src/modules/auth/auth.service.ts` | **OTP:** Integrate Twilio (or another SMS provider); remove or narrow any demo-only logging. **Login:** `login()` is a **demo** path (password length only, no hash check). For production, replace or guard with real credential verification (e.g. hashed passwords, IdP, or staff-only SSO). |
| `apps/api/src/config/graphql.config.ts` | Disable playground/introspection in production via env. |
| `apps/api/src/modules/queue/queue.gateway.ts` | Socket.IO CORS lists `http://localhost:4200`, `:4300`, `:4400`. For production, drive allowed origins from config (same as `FRONTEND_URL` or dedicated `WS_CORS_ORIGINS`). |

### 2.2 Frontends — production build configuration

Angular apps use **`environment.prod.ts`** for production builds. Update URLs to match your hosting.

| App | File | Typical changes |
|-----|------|------------------|
| Admin dashboard | `apps/admin-dashboard/src/environments/environment.prod.ts` | `graphqlUrl` (often `/graphql` behind same host), `wsUrl` (e.g. `wss://api.yourdomain.com/graphql`), `apiUrl` if used. |
| Customer mobile | `apps/customer-mobile/src/environments/environment.prod.ts` | Same pattern. |
| Queue display | `apps/queue-display/src/environments/environment.prod.ts` | Same pattern. |

**Dev-only file (do not use as production config):**

| File | Purpose |
|------|---------|
| `apps/*/src/environments/environment.ts` | Local `localhost:3000` GraphQL/WebSocket URLs. |

**Reverse proxy:** `apps/*/proxy.conf.json` targets `http://localhost:3000` for **local** `nx serve` only; production usually uses nginx/Caddy/CloudFront rules instead.

### 2.3 Database seed (optional in production)

| File | Notes |
|------|--------|
| `prisma/seed.ts` | Creates demo shops, users, barbers, QR codes, etc. Safe for **staging**; for production, usually run **once** with reviewed data or skip and create real tenants via admin tools. QR URLs use `MOBILE_URL` or default `http://localhost:4300`. |

### 2.4 Tooling (development only)

| File | Notes |
|------|--------|
| `libs/graphql-schema/codegen.yml` | Points at `http://localhost:3000/graphql` for codegen; no production impact, but developers need the API running locally or an override. |

---

## 3. Static and demo data (inventory)

These are **not** production user data; they exist for local demos, fallbacks, or tests. For go-live you either **remove fallbacks**, **gate them behind `!environment.production`**, or **ensure the API always returns real data** so fallbacks never run.

### 3.1 Admin dashboard — pre-filled login (dev only)

| File | Content |
|------|---------|
| `apps/admin-dashboard/src/environments/environment.ts` | `devLoginDefaults`: emails, `demo1234`, customer phone `+919900010001`, OTP `123456`. |

**Production:** `environment.prod.ts` has **no** `devLoginDefaults`; production builds do not include those pre-fills. Do not add secrets there.

### 3.2 API — demo auth behavior

| File | Content |
|------|---------|
| `apps/api/src/modules/auth/auth.service.ts` | Default demo OTP `123456` when non-production and `DEV_STATIC_OTP` unset; `login()` without password verification. |

### 3.3 Admin dashboard — mock UI data (fallback when API empty/errors)

| File | Content |
|------|---------|
| `apps/admin-dashboard/src/app/features/customers/pages/customers/customers.page.ts` | `MOCK_CUSTOMERS`, `MOCK_HISTORY` and fallback logic. |
| `apps/admin-dashboard/src/app/features/bookings/pages/bookings/bookings.page.ts` | `MOCK_BOOKINGS` and fallback logic. |

For production, plan to **rely on GraphQL only** and show empty/error states instead of mock rows, or remove mocks once resolvers are stable.

### 3.4 Other demo touches

| File | Content |
|------|---------|
| `apps/admin-dashboard/src/app/features/auth/pages/reset-password/reset-password.page.ts` | Default query param `demo-token` if no token. |
| `apps/admin-dashboard/src/app/features/auth/pages/login/login.page.html` | OTP placeholder text `123456` (cosmetic). |
| `apps/admin-dashboard/src/app/core/services/auth/auth.service.ts` | Phone normalization comment “Default to +1 for demo”. |

### 3.5 Seed script (canonical “static” dataset)

| File | Content |
|------|---------|
| `prisma/seed.ts` | Fixed emails (e.g. `admin@trimtime.app`, `owner@demo.trimtime.app`, `mike@demo.trimtime.app`), phones, shop slugs, `seed-*` ids, demo QR codes, subscription plans. |

---

## 4. Suggested go-live order

1. Set **production** env vars (`NODE_ENV`, `DATABASE_URL`, `REDIS_URL`, `JWT_*`, `FRONTEND_URL`, `MOBILE_URL`).
2. Run **migrations** (`prisma migrate deploy`); run **seed** only if you intentionally want bootstrap data.
3. Build frontends with **production** configuration; deploy API + static apps behind HTTPS.
4. Align **CORS** (`main.ts` / `FRONTEND_URL`) and **WebSocket** CORS (`queue.gateway.ts`) with real origins.
5. Implement **SMS OTP** and turn off any dependency on demo OTP behavior.
6. Replace or secure **`login` mutation** if staff/owner/admin still use password in the UI.
7. Disable **GraphQL playground/introspection** in production unless required.
8. Audit **mock data** pages; remove fallbacks when APIs are reliable.

---

## 5. Quick reference — “is this static / demo?”

- **`.env` / hosting secrets** → Production source of truth for URLs and keys.
- **`environment.ts` (non-prod)** → Local URLs and dev login pre-fills.
- **`environment.prod.ts`** → Production client endpoints (must match your domain).
- **`prisma/seed.ts`** → One-off bootstrap data; not your ongoing production dataset unless you design it that way.
- **`auth.service.ts` OTP + `login`** → Demo behavior until SMS and real auth are implemented.
- **`*MOCK*` in admin-dashboard pages** → UI-only demo data when the backend returns nothing or errors.

Keep this document updated when you add new demo flags or environment variables.
