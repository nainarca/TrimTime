# QueueCut / TrimTime — Complete Developer Documentation

> **Audience:** Frontend devs, backend devs, product team, new joiners
> **Goal:** Read this once → start contributing immediately

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [System Architecture](#2-system-architecture)
3. [Complete User Flows](#3-complete-user-flows)
4. [Backend Module Breakdown](#4-backend-module-breakdown)
5. [Frontend Module Breakdown](#5-frontend-module-breakdown)
6. [Technology Choices](#6-technology-choices)
7. [How to Run & Setup](#7-how-to-run--setup)
8. [How to Customize the Project](#8-how-to-customize-the-project)
9. [Current Project Status](#9-current-project-status)
10. [Roadmap](#10-roadmap)
11. [Current Position in Roadmap](#11-current-position-in-roadmap)
12. [Developer Checklists](#12-developer-checklists)
13. [Known Limitations](#13-known-limitations)
14. [Future Improvements](#14-future-improvements)

---

## 1. Project Overview

### What is QueueCut / TrimTime?

QueueCut (branded **TrimTime**) is a **SaaS queue management platform for barber shops**. It replaces the old "wait outside / call your name" model with a smart digital queue that works on any smartphone — no app download needed.

### Problem it Solves

| Old Way | TrimTime Way |
|---|---|
| Customers wait physically at the shop | Customers join queue via QR code, wait anywhere |
| No idea of wait time | Live position + estimated wait time |
| Owner can't see who's next from phone | Full queue dashboard on any browser |
| TV just shows a number | Animated display screen with real-time updates |
| No booking system | Customers can pre-book appointments |

### Key Features

- **QR Code Check-In** — Scan code → join queue in under 30 seconds
- **Live Queue Tracker** — Real-time position, wait time, status (Waiting → Called → Serving)
- **Shop Dashboard** — Manage queue, barbers, services, bookings
- **Appointment Booking** — Choose barber, date, time, multiple services
- **Queue Display Screen** — Large kiosk display for shop TV
- **Multi-branch Support** — One shop, multiple locations
- **Roles** — Customer, Barber, Shop Owner, Admin

### Target Users

| User | What they do |
|---|---|
| **Shop Owner** | Manages shop, barbers, services, views reports |
| **Barber** | Manages their queue, calls next customer |
| **Customer** | Scans QR, joins queue, tracks status, books appointments |
| **Display Screen** | Read-only kiosk showing live queue for shop TV |

---

## 2. System Architecture

### High-Level Diagram

```
┌────────────────────────────────────────────────────────────────────┐
│                         CLIENT APPS                                │
│                                                                    │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐ │
│  │  Admin Dashboard │  │  Customer Mobile │  │  Queue Display   │ │
│  │  (Angular 17)    │  │  (Ionic 8)       │  │  (Angular 17)    │ │
│  │  localhost:4201  │  │  localhost:4300  │  │  localhost:4400  │ │
│  └────────┬─────────┘  └────────┬─────────┘  └────────┬─────────┘ │
└───────────┼─────────────────────┼─────────────────────┼───────────┘
            │                     │                     │
            │   Apollo Client (GraphQL + WebSocket)     │
            │                     │                     │
┌───────────▼─────────────────────▼─────────────────────▼───────────┐
│                      BACKEND API (NestJS)                          │
│                      localhost:3000/graphql                        │
│                                                                    │
│   GraphQL API (Code-first)         WebSocket (graphql-ws)         │
│   ┌──────────────────────────────────────────────────────────┐    │
│   │  Modules: Auth · Users · Shops · Queue · Barbers ·       │    │
│   │           Services · Appointments · Reports ·            │    │
│   │           Notifications · Health                         │    │
│   └──────────────────────────────────────────────────────────┘    │
│           │                              │                         │
│    ┌──────▼──────┐              ┌────────▼───────┐                 │
│    │ PostgreSQL  │              │     Redis      │                 │
│    │ (Prisma 5)  │              │  Cache/OTP/    │                 │
│    │ 20 models   │              │  Ticket counter│                 │
│    └─────────────┘              └────────────────┘                 │
└────────────────────────────────────────────────────────────────────┘
```

### Nx Monorepo Structure

```
d:\Project\Queuecut\
├── apps/
│   ├── api/                  ← NestJS backend (port 3000)
│   ├── admin-dashboard/      ← Angular + PrimeNG (port 4201)
│   ├── customer-mobile/      ← Ionic + Angular (port 4300)
│   └── queue-display/        ← Angular kiosk (port 4400)
│
├── libs/
│   ├── shared-types/         ← TypeScript interfaces, enums (all apps import)
│   ├── shared-utils/         ← Pure utility functions (phone, date, OTP)
│   ├── shared/               ← Angular-specific shared utilities
│   ├── queue-engine/         ← Pure queue algorithms (EWT, ticket, sorting)
│   ├── auth/                 ← Cross-app JWT helpers
│   ├── graphql-schema/       ← Apollo codegen config
│   └── ui-components/        ← Reusable Angular components
│
├── prisma/
│   ├── schema.prisma         ← 20 database models
│   └── seed.ts               ← Demo data seeder
│
├── docker/                   ← docker-compose for local infra
├── nx.json                   ← Nx workspace config
├── package.json              ← Root workspace (shared deps)
└── .env.example              ← All environment variables
```

---

### Backend Architecture (NestJS)

```
apps/api/src/
├── main.ts                   ← Bootstrap: port, CORS, pipes, filters
├── config/
│   └── graphql.config.ts     ← Apollo, WebSocket, playground settings
├── app/
│   └── app.module.ts         ← Root module (imports all feature modules)
├── modules/
│   ├── auth/                 ← JWT + OTP authentication
│   ├── users/                ← User profiles
│   ├── shops/                ← Shop + branch management
│   ├── queue/                ← Queue engine (CORE module)
│   ├── notifications/        ← Event-driven SMS/Push/In-App
│   ├── database/             ← PrismaService
│   └── redis/                ← RedisService
├── appointments/             ← Booking module
├── barbers/                  ← Staff module
├── services/                 ← Service catalog
├── reports/                  ← Analytics
├── health/                   ← Health check endpoint
└── common/                   ← Global filters, interceptors, decorators
```

**Each NestJS module follows this pattern:**
```
modules/queue/
├── queue.module.ts           ← Module declaration (providers, exports)
├── queue.resolver.ts         ← GraphQL resolvers (Queries/Mutations/Subscriptions)
├── queue.service.ts          ← Business logic
├── queue.dto.ts              ← Input types (validated with class-validator)
└── models/
    └── queue-entry.model.ts  ← GraphQL output type (@ObjectType)
```

**Authentication layers:**
```
Request
  → GqlJwtGuard (validates JWT in Authorization header)
  → RolesGuard (@Roles decorator check: CUSTOMER | BARBER | SHOP_OWNER | ADMIN)
  → TenantGuard (ensures shopId in token matches requested shop)
  → Resolver method
```

**Real-time flow (WebSocket):**
```
Queue status change (e.g. WAITING → CALLED)
  → QueueService.updateStatus()
  → EventEmitter2.emit('queue.updated', { shopId, barberId, entries })
  → QueueEventListener.handleQueueUpdated()
  → PubSub.publish('QUEUE_UPDATED', payload)
  → GraphQL Subscription → all connected clients for that shopId
```

---

### Frontend Architecture (Angular)

All three Angular apps share the same pattern:

```
src/app/
├── app.routes.ts             ← Routing (standalone, lazy-loaded)
├── core/
│   ├── auth/                 ← AuthGuard, AuthInterceptor, TokenService
│   ├── layout/               ← Shell component, navbar, sidebar
│   └── services/             ← Shared services (toast, tenant context)
└── features/
    └── {feature}/
        ├── {feature}.page.ts       ← Standalone component + logic
        ├── {feature}.page.html     ← Template
        ├── {feature}.page.scss     ← Styles
        └── graphql/
            └── {feature}.gql.ts   ← Apollo queries/mutations
```

**State management:** No NgRx. Component-level state + Apollo cache + RxJS BehaviorSubjects.

**Apollo Client setup:**
- HTTP link for queries/mutations (`/graphql`)
- WebSocket link for subscriptions (`ws://localhost:3000/graphql`)
- `fetchPolicy: 'network-only'` on reads (avoids stale Apollo cache)
- All read queries use `apollo.query()` (completes after 1 emission) — **not** `watchQuery().valueChanges` (never completes, breaks `forkJoin`)

---

### Database Architecture (Prisma + PostgreSQL)

**20 models, key relationships:**

```
User (1) ──────────────────── (*) UserRoleAssignment
  │                                     │ (role scoped per shop)
  │ owns
  ▼
Shop (1) ──── (*) ShopBranch
  │               │
  │ has           │ has
  ▼               ▼
Barber (*)    QueueEntry (*)
  │               │
  │ offers        │ references
  ▼               ▼
BarberService(*) Service (*)
                  │
                  │ used in
                  ▼
              Appointment (*)
```

**Queue entry lifecycle:**
```
QueueEntry.status:
  WAITING → CALLED → SERVING → SERVED
                 ↘ NO_SHOW
  WAITING ──────────────────────────→ LEFT
```

---

## 3. Complete User Flows

### Admin Flow

```
1. LOGIN
   Browser → /auth/login
   Enter: username + password (demo) OR phone → OTP
   On success: JWT stored in localStorage, redirect to /dashboard

2. DASHBOARD
   /dashboard → shows: today's queue count, avg wait, served count, active barbers
   Live numbers via Apollo subscription

3. MANAGE QUEUE (daily workflow)
   /queue → see all active entries in a PrimeNG table
   Click "Call" → entry status: WAITING → CALLED (customer gets notification)
   Click "Serve" → CALLED → SERVING
   Click "Done" → SERVING → SERVED
   Click "No Show" → CALLED → NO_SHOW

4. MANAGE BARBERS
   /barbers → list all barbers
   Add → modal with name, bio, photo URL, services offered
   Edit → update availability, avgServiceDurationMins
   Delete → soft-delete (isActive: false)

5. MANAGE SERVICES
   /services → list all services (Haircut, Beard, etc.)
   Add/Edit → name, price, duration (minutes), active toggle

6. VIEW REPORTS
   /reports → daily stats, service usage breakdown, avg wait times
   Filtered by date range, barber, service

7. SETTINGS
   /settings → shop name, logo, timezone, currency, OTP config
```

### Customer Flow

```
1. SCAN QR CODE
   Customer scans QR at shop → opens mobile browser → /shop/{slug}

2. SHOP LANDING PAGE
   Sees: shop name, branch, list of barbers, available services
   Options: "Join Queue" or "Book Appointment"

3. JOIN QUEUE (walk-in)
   /join-queue?shopId=...&branchId=...
   Enter: name, phone (optional), select barber (optional)
   Tap "Join" → QueueEntry created → redirected to /queue/{entryId}

4. LIVE TRACKER
   /queue/{entryId}
   Shows: ticket number, position, estimated wait in minutes
   Real-time updates via GraphQL subscription
   Status changes: "Waiting" → "You're being called!" → "You're being served"

5. BOOK APPOINTMENT
   /book-appointment?shopId=...&branchId=...
   Step 1: Select barber
   Step 2: Select service(s) + date chip + time slot
   Step 3: Enter name + phone → Confirm
   Backend creates Appointment (PENDING)

6. SERVED / DONE
   Status → SERVED → review prompt
```

### Queue Status Transitions

```
State Machine:

  ┌─────────┐    Admin: "Call"    ┌─────────┐
  │ WAITING │ ──────────────────→ │ CALLED  │
  └─────────┘                     └────┬────┘
       │                               │ Admin: "Serve"
       │ Customer: "Leave"             ▼
       │                          ┌─────────┐    Admin: "Done"   ┌────────┐
       └──────────────────────→   │ SERVING │ ─────────────────→ │ SERVED │
       (also from CALLED)         └─────────┘                    └────────┘
                                       │
                                       │ Admin: "No Show"
                                       ▼
                                  ┌─────────┐
                                  │ NO_SHOW │
                                  └─────────┘

  Terminal states: SERVED, NO_SHOW, LEFT, REMOVED
  (cannot transition out of these)
```

### Real-time Flow (WebSocket)

```
Admin presses "Call Next"
  │
  ▼
HTTP POST → GraphQL mutation: updateQueueStatus(entryId, "CALLED")
  │
  ▼
QueueService.updateStatus() → Prisma UPDATE
  │
  ▼
EventEmitter2.emit('queue.updated', { shopId, updatedEntry, activeEntries })
  │
  ▼
PubSub.publish('QUEUE_UPDATED', payload)
  │
  ├─→ Admin Dashboard WebSocket client → table auto-updates
  ├─→ Queue Display WebSocket client → ticket number animates
  └─→ Customer Mobile WebSocket client → "You're being called!" alert
```

---

## 4. Backend Module Breakdown

### AuthModule

**Path:** `apps/api/src/modules/auth/`

**Purpose:** OTP-based phone login + JWT token management

**Key Resolvers:**
```graphql
mutation RequestOtp(phone: String!): OtpResponse
mutation VerifyOtp(phone: String!, otp: String!): AuthPayload
mutation Login(username: String!, password: String!, role: String): AuthPayload
mutation RefreshToken(refreshToken: String!): TokenPair
mutation Logout: Boolean
```

**Data flow:**
```
requestOtp(phone)
  → generateOtp(6) → hash with bcrypt
  → Redis.set("otp:{phone}", hash, TTL=300s)
  → DEV: return otp in response | PROD: Twilio.sendSms()

verifyOtp(phone, otp)
  → Redis.get("otp:{phone}") → bcrypt.compare(otp, hash)
  → upsert User (create if first visit, role=CUSTOMER)
  → sign JWT (sub: userId, roles, shopIds, exp: 15m)
  → sign refresh token (exp: 30d) → store in Redis
  → return { accessToken, refreshToken, user }
```

**Guards used:** None on auth endpoints; `GqlJwtGuard` on all others.

---

### UsersModule

**Path:** `apps/api/src/modules/users/`

**Purpose:** User profile management

**Key Resolvers:**
```graphql
query Me: UserProfile                     # requires auth
mutation UpdateProfile(input): UserProfile
```

---

### ShopsModule

**Path:** `apps/api/src/modules/shops/`

**Purpose:** Shop and branch CRUD

**Key Resolvers:**
```graphql
query ShopBySlug(slug: String!): Shop     # public
query MyShop: Shop                        # owner only
query ShopBranches(shopId: ID!): [Branch]
mutation CreateShop(input): Shop
mutation UpdateShop(id: ID!, input): Shop
mutation CreateBranch(input): Branch
```

---

### QueueModule ⭐ (Core)

**Path:** `apps/api/src/modules/queue/`

**Purpose:** All queue operations — the heart of the system

**Key Resolvers:**
```graphql
query ActiveQueue(shopId: ID!, barberId: ID): [QueueEntry]
query QueueEntry(entryId: ID!): QueueEntry
query QueueStats(shopId: ID!, barberId: ID): QueueStats
mutation JoinQueue(input: JoinQueueInput!): QueueEntry      # public (guest allowed)
mutation UpdateQueueStatus(entryId: ID!, newStatus: QueueStatus!): QueueEntry
mutation LeaveQueue(entryId: ID!): Boolean
subscription QueueUpdated(shopId: ID!, barberId: ID): QueueUpdateEvent
```

**JoinQueueInput fields:**
```typescript
{
  shopId: string;
  branchId: string;
  barberId?: string;       // optional barber preference
  serviceId?: string;      // optional service
  entryType: 'WALK_IN' | 'ONLINE' | 'APPOINTMENT';
  priority: number;        // 0 = normal, higher = priority
  guestName?: string;      // for non-logged-in customers
  guestPhone?: string;
  notes?: string;
}
```

**Ticket assignment (Redis):**
```
key: "ticket:counter:{shopId}:{YYYY-MM-DD}"
INCR → returns next number (1, 2, 3... up to 999, then wraps)
formatTicket(42) → "A042"
```

**Recalculate queue** (runs after every join/status change):
```
1. Fetch all WAITING + CALLED entries for shopId/barberId
2. sortQueueEntries() → sort by priority DESC, joinedAt ASC
3. assignPositions() → set position = 1, 2, 3...
4. calculateEwt() for each entry based on position + avg service time
5. Bulk UPDATE positions + estimatedWaitMins
6. Emit QUEUE_UPDATED event
```

---

### BarbersModule

**Path:** `apps/api/src/barbers/`

**Purpose:** Staff profiles and availability

**Key Resolvers:**
```graphql
query PublicBarbers(shopId: ID!): [Barber]   # public, for customer mobile
query Barbers(shopId: ID!): [Barber]         # owner/admin only
mutation UpsertBarber(input: BarberInput!): Barber
mutation DeleteBarber(id: ID!): Boolean
```

**Barber fields:** `displayName`, `bio`, `avatarUrl`, `isActive`, `queueAccepting`, `avgServiceDurationMins`, `currentStatus` (AVAILABLE | BUSY | ON_BREAK | OFFLINE)

---

### ServicesModule

**Path:** `apps/api/src/services/`

**Purpose:** Service catalog (Haircut, Beard Trim, etc.)

**Key Resolvers:**
```graphql
query PublicServices(shopId: ID!): [Service]   # public
query Services(shopId: ID!): [Service]         # owner only
mutation UpsertService(input: ServiceInput!): Service
mutation DeleteService(id: ID!): Boolean
```

**Service fields:** `name`, `description`, `durationMins`, `price`, `currency`, `isActive`

---

### AppointmentsModule

**Path:** `apps/api/src/appointments/`

**Purpose:** Pre-booked appointments (scheduled queue entries)

**Key Resolvers:**
```graphql
mutation BookAppointmentAsGuest(input: GuestBookAppointmentInput!): Appointment  # public
mutation CreateAppointment(input): Appointment      # auth required
mutation CancelAppointment(id: ID!): Boolean
query AppointmentsByShop(shopId: ID!, date: String): [Appointment]
```

**GuestBookAppointmentInput:**
```typescript
{
  shopId: string;
  branchId: string;
  barberId: string;
  serviceId: string;         // primary service
  scheduledAt: string;       // ISO 8601
  guestName: string;
  guestPhone: string;
  notes?: string;            // additional services listed here
}
```

---

### ReportsModule

**Path:** `apps/api/src/reports/`

**Purpose:** Analytics queries

**Key Resolvers:**
```graphql
query DailyQueueStats(shopId: ID!, date: String): DailyStats
query AverageWaitTime(shopId: ID!, days: Int): Float
query ServicesUsage(shopId: ID!, days: Int): [ServiceUsageStat]
```

---

### NotificationsModule

**Path:** `apps/api/src/modules/notifications/`

**Purpose:** Event-driven multi-channel notifications

**Channels:** IN_APP · SMS (Twilio) · EMAIL (SendGrid) · PUSH (Firebase stub) · WHATSAPP

**How it works:**
```
QueueService emits: 'queue.entry.called' event
  → NotificationListener.onEntryCalled()
  → NotificationService.dispatch({ channel, userId, template, vars })
  → IN_APP: PubSub notification
  → SMS: TwilioService.send(phone, message)
  → Logs to NotificationLog table
```

---

## 5. Frontend Module Breakdown

### Admin Dashboard

**Stack:** Angular 17 standalone, PrimeNG 17, Apollo Angular

#### Dashboard Page (`/dashboard`)
- **Components:** PrimeNG cards, Chart.js
- **API:** `DailyQueueStats`, `AverageWaitTime` queries
- **Behavior:** Numbers refresh every 30s; subscription for live count badge

#### Queue Monitor Page (`/queue`)
- **Components:** PrimeNG DataTable, status action buttons
- **API:** `ActiveQueue` query + `QueueUpdated` subscription
- **Behavior:**
  - Table shows all WAITING/CALLED/SERVING entries
  - Row colors: green = SERVING, amber = CALLED
  - Buttons: Call, Serve, Done, No Show
  - Auto-updates on WebSocket message (no manual refresh)

#### Barbers Page (`/barbers`)
- **Components:** PrimeNG DataTable + Dialog (add/edit form)
- **API:** `Barbers` query, `UpsertBarber`, `DeleteBarber` mutations
- **Behavior:** Inline edit dialog; toggle isActive / queueAccepting

#### Services Page (`/services`)
- **Components:** PrimeNG DataTable + Dialog
- **API:** `Services` query, `UpsertService`, `DeleteService`
- **Behavior:** Price/duration editable per service

#### Bookings Page (`/bookings`)
- **Components:** PrimeNG DataTable (date-filtered)
- **API:** `AppointmentsByShop` query
- **Behavior:** List future appointments; cancel action

#### Reports Page (`/reports`)
- **Components:** Chart.js line/bar charts, stat cards
- **API:** `DailyQueueStats`, `ServicesUsage`
- **Behavior:** Date range filter; per-barber breakdown

#### Settings Page (`/settings`)
- **Components:** Form fields, file upload
- **API:** `UpdateShop` mutation
- **Behavior:** Save shop info, timezone, currency

---

### Customer Mobile App

**Stack:** Ionic 8, Angular 17 standalone, Apollo Angular

#### Scanner Page (`/tabs/scan`)
- **Components:** Capacitor BarcodeScannerPlugin
- **Behavior:** Opens camera, reads QR → extracts shop slug → navigate to `/shop/{slug}`
- **Fallback:** Manual URL entry field

#### Shop Landing Page (`/shop/:slug`)
- **Components:** Ion cards, service list, barber chips
- **API:** `ShopBySlug`, `ShopBranchesBySlug`, `PublicBarbers`, `PublicServices` — all via `forkJoin`
- **Behavior:** Shows shop info, active barbers, service list, branch selector; CTA buttons: "Join Queue" / "Book Appointment"

#### Join Queue Page (`/join-queue`)
- **Components:** Ion input fields, barber selector
- **API:** `JoinQueue` mutation
- **Behavior:** Guest form (name, phone); barber selection; submits → navigates to tracker

#### Live Tracker Page (`/queue/:entryId`)
- **Components:** Large ticket number card, position badge, EWT chip
- **API:** `QueueEntry` query + `QueueUpdated` subscription
- **Behavior:**
  - Auto-subscribes on load
  - Status badges: Waiting (blue) → Called (amber, plays sound) → Serving (green)
  - Vibrates on CALLED status

#### Book Appointment Page (`/book-appointment`)
- **Components:** Barber grid, service checkbox list, date chip scroll, time slot grid
- **API:** `PublicBarbers`, `PublicServices`, `BookAppointmentAsGuest` mutation
- **Behavior (3 steps):**
  - Step 1: Select barber (grid, shows avatar + status)
  - Step 2: Multi-select services + scrollable 14-day date chips + 4-column time grid
  - Step 3: Review summary + enter name/phone → confirm

#### Profile Page (`/tabs/profile`)
- **Components:** Ion list, avatar
- **API:** `Me` query
- **Behavior:** Show user info, logout, queue history link

---

### Queue Display Kiosk (`/display/:shopId`)

**Stack:** Angular 17, Socket.io

#### Display Page
- **Layout:**
  ```
  ┌──────────────────────────────────────────────┐
  │  NOW SERVING           │   QUEUE              │
  │                        │   2. A043            │
  │      A042              │   3. A044            │
  │  (animated large)      │   4. A045            │
  │                        │   5. A046            │
  │  Up Next: A043         │   ...                │
  ├──────────────────────────────────────────────┤
  │  Waiting: 8  │  Avg Wait: 12 min  │  ●● LIVE │
  └──────────────────────────────────────────────┘
  ```
- **Animations:** Ticket number glows + pulses on change; full-screen ambient glow
- **API:** `ActiveQueue` query + `QueueUpdated` subscription + `QueueStats`
- **Sound:** Chime audio on each new "currently serving" change

#### Setup Page (`/setup`)
- One-time config: enter shop ID or slug → saves to localStorage → navigates to display

---

## 6. Technology Choices

| Technology | Why |
|---|---|
| **NestJS** | Modular architecture, built-in DI, decorators match GraphQL code-first approach well |
| **GraphQL (code-first)** | Single endpoint, type-safe, auto-generated schema, subscriptions built-in |
| **Prisma 5** | Type-safe DB queries, auto-migration, excellent TypeScript integration |
| **PostgreSQL** | Relational data (shops ↔ barbers ↔ services), ACID transactions for queue ops |
| **Redis** | Ticket counters (atomic INCR), OTP storage (TTL), PubSub for real-time events |
| **Angular 17 (standalone)** | No NgModule boilerplate, tree-shaking, lazy routes |
| **PrimeNG** | Production-ready enterprise UI (DataTable, Dialog, Toast) with theming |
| **Ionic 8** | Cross-platform mobile web, native-feel components, Capacitor for camera |
| **Apollo Angular** | GraphQL client with caching, WebSocket link for subscriptions |
| **Nx Monorepo** | Shared libs across apps, dependency graph, single install, coordinated builds |

---

## 7. How to Run & Setup

### Prerequisites

- Node.js 20+
- PostgreSQL 15+
- Redis 7+
- npm 9+

### 1. Clone & Install

```bash
git clone <repo>
cd Queuecut
npm install
```

### 2. Environment Setup

```bash
cp .env.example .env
# Edit .env with your local DB and Redis settings
```

Minimum required:
```env
DATABASE_URL=postgresql://postgres:password@localhost:5432/trimtime_dev
REDIS_URL=redis://localhost:6379
JWT_SECRET=any-long-random-string
JWT_REFRESH_SECRET=another-long-random-string
DEV_STATIC_OTP=123456
NODE_ENV=development
```

### 3. Database Setup

```bash
# Generate Prisma client
npm run prisma:generate

# Run migrations (creates all 20 tables)
npm run prisma:migrate

# Seed demo data (shop, barbers, services, admin user)
npm run prisma:seed
```

**Seed credentials (from seed.ts):**
```
Admin login:    admin / admin123
Owner login:    owner / owner123
Barber login:   barber / barber123
Shop slug:      elite-barber-lounge
Dev OTP code:   123456
```

### 4. Run Applications

Open 4 separate terminals:

```bash
# Terminal 1: Backend API
npm run start:api
# → http://localhost:3000/graphql (GraphQL Playground)

# Terminal 2: Admin Dashboard
npm run start:dashboard
# → http://localhost:4201

# Terminal 3: Customer Mobile
npm run start:mobile
# → http://localhost:4300

# Terminal 4: Queue Display
npm run start:display
# → http://localhost:4400
```

### 5. Docker (Alternative)

```bash
# Start PostgreSQL + Redis only
npm run docker:up

# Stop
npm run docker:down

# View logs
npm run docker:logs
```

### 6. Verify Setup

1. Open `http://localhost:3000/graphql` → GraphQL Playground loads
2. Open `http://localhost:4201` → Admin login screen
3. Login with `admin` / `admin123`
4. Open `http://localhost:4300/shop/elite-barber-lounge` → Shop landing page

---

## 8. How to Customize the Project

### Add a New Backend Feature

**Example: Add a "Promotions" module**

```bash
# 1. Generate NestJS module
nx g @nestjs/schematics:module promotions --project=api
```

```
# 2. Create files:
apps/api/src/promotions/
├── promotions.module.ts
├── promotions.resolver.ts    ← @Query, @Mutation decorators
├── promotions.service.ts     ← business logic + Prisma calls
├── promotion.model.ts        ← @ObjectType for GraphQL
└── promotion.dto.ts          ← @InputType for mutations
```

```typescript
// 3. Register in AppModule (apps/api/src/app/app.module.ts)
@Module({
  imports: [
    // ... existing modules
    PromotionsModule,
  ],
})
export class AppModule {}
```

```prisma
// 4. Add Prisma model (prisma/schema.prisma)
model Promotion {
  id        String   @id @default(uuid())
  shopId    String
  title     String
  discount  Float
  validUntil DateTime
  shop      Shop     @relation(fields: [shopId], references: [id])
}
```

```bash
# 5. Run migration
npm run prisma:migrate
```

### Add a New Admin Dashboard Page

```bash
# 1. Generate component
nx g @schematics/angular:component features/promotions/pages/promotions \
  --project=admin-dashboard --standalone
```

```typescript
// 2. Add to routing (apps/admin-dashboard/src/app/app.routes.ts)
{
  path: 'promotions',
  loadComponent: () => import('./features/promotions/pages/promotions/promotions.page')
    .then(m => m.PromotionsPage),
  canActivate: [AuthGuard],
}
```

```typescript
// 3. Add GraphQL operations
// apps/admin-dashboard/src/app/features/promotions/graphql/promotions.gql.ts
export const GET_PROMOTIONS = gql`
  query GetPromotions($shopId: ID!) {
    promotions(shopId: $shopId) { id title discount validUntil }
  }
`;
```

### Modify UI (PrimeNG)

The admin dashboard uses [lara-dark-blue PrimeNG theme](https://primeng.org/theming).

**Available PrimeNG components already imported:**
- `p-table` (DataTable) — queue list, barber list
- `p-dialog` — add/edit modals
- `p-toast` — notifications
- `p-button`, `p-badge`, `p-tag`, `p-chip`
- `p-chart` — analytics (Chart.js wrapper)

**Override PrimeNG styles** in `apps/admin-dashboard/src/styles.scss`:
```scss
// Use ::ng-deep or global overrides
.p-datatable .p-datatable-thead > tr > th {
  background: var(--tt-surface-alt);
}
```

### Add a New GraphQL Resolver

```typescript
// apps/api/src/promotions/promotions.resolver.ts
@Resolver(() => PromotionModel)
export class PromotionsResolver {
  constructor(private readonly svc: PromotionsService) {}

  @Query(() => [PromotionModel])
  @UseGuards(GqlJwtGuard)
  promotions(@Args('shopId') shopId: string): Promise<PromotionModel[]> {
    return this.svc.findAll(shopId);
  }

  @Mutation(() => PromotionModel)
  @UseGuards(GqlJwtGuard, RolesGuard)
  @Roles(UserRole.SHOP_OWNER, UserRole.ADMIN)
  createPromotion(
    @Args('input') input: CreatePromotionInput,
  ): Promise<PromotionModel> {
    return this.svc.create(input);
  }
}
```

### Add a New Role / Permission

```typescript
// 1. Add to UserRole enum (libs/shared-types/src/enums.ts)
export enum UserRole {
  CUSTOMER = 'CUSTOMER',
  BARBER = 'BARBER',
  SHOP_OWNER = 'SHOP_OWNER',
  ADMIN = 'ADMIN',
  RECEPTIONIST = 'RECEPTIONIST',  // NEW
}

// 2. Update Prisma schema enum
// prisma/schema.prisma
enum UserRole {
  CUSTOMER
  BARBER
  SHOP_OWNER
  ADMIN
  RECEPTIONIST
}

// 3. Use in resolver
@Roles(UserRole.RECEPTIONIST, UserRole.SHOP_OWNER)
```

---

## 9. Current Project Status

### Backend — ~75% Complete

| Module | Status | Notes |
|---|---|---|
| Auth (OTP + JWT) | ✅ Complete | Dev: static OTP 123456; Prod: needs Twilio |
| Users | ✅ Complete | Profile CRUD done |
| Shops + Branches | ✅ Complete | Multi-branch supported |
| Queue (core) | ✅ Complete | Join, call, serve, positions, EWT, subscription |
| Barbers | ✅ Complete | CRUD, availability toggle |
| Services | ✅ Complete | Catalog CRUD |
| Appointments | ✅ Complete | Guest booking + admin creation |
| Notifications | ⚠️ Partial | In-app works; SMS stubs wired but Twilio not configured |
| Reports / Analytics | ⚠️ Partial | Basic stats done; no date-range trending yet |
| Payments | ❌ Missing | Stripe/UPI wiring not started |
| Subscriptions (SaaS) | ❌ Missing | Plans/tiers schema exists; no billing logic |
| QR Code Generation | ⚠️ Partial | QrCode model exists; generation endpoint missing |

### Admin Dashboard — ~65% Complete

| Page | Status | Notes |
|---|---|---|
| Login / Auth | ✅ Complete | OTP + password login |
| Queue Monitor | ✅ Complete | Live table, status buttons |
| Barbers Management | ✅ Complete | Full CRUD |
| Services Management | ✅ Complete | Full CRUD |
| Dashboard Overview | ⚠️ Partial | Stats wired; charts partial |
| Bookings | ⚠️ Partial | List view done; calendar view missing |
| Customers | ⚠️ Partial | List view; no history/details |
| Reports | ⚠️ Partial | Basic stats; no trends or export |
| Settings | ⚠️ Partial | Basic shop settings; no logo upload |
| Finance | ❌ Missing | Page exists; no data wired |
| Marketing / QR | ❌ Missing | Page exists; no QR generation |

### Customer Mobile — ~70% Complete

| Page | Status | Notes |
|---|---|---|
| QR Scanner | ✅ Complete | Camera scan + manual URL |
| Shop Landing | ✅ Complete | Barbers, services, branch info |
| Join Queue (guest) | ✅ Complete | Guest form, barber selection |
| Live Tracker | ✅ Complete | Real-time position + status |
| Book Appointment | ✅ Complete | Multi-service, custom date/time picker |
| Profile | ⚠️ Partial | Static; no auth-aware data |
| History | ⚠️ Partial | Page exists; no API wired |
| Payment Screen | ❌ Missing | Not started |
| Reviews / Rating | ❌ Missing | Model exists; no UI |

### Queue Display Kiosk — ~85% Complete

| Feature | Status |
|---|---|
| Live queue display | ✅ Complete |
| Animations | ✅ Complete |
| Sound alerts | ✅ Complete |
| Setup page | ✅ Complete |
| Multi-barber filter | ⚠️ Partial |

### Overall: ~72% Complete

---

## 10. Roadmap

### Phase 1 — Core MVP ✅ (Current)

- [x] OTP authentication
- [x] Shop + barber + service management
- [x] Queue join, track, manage (full lifecycle)
- [x] Live WebSocket updates
- [x] Queue display kiosk
- [x] Guest appointment booking
- [x] Admin dashboard (queue, barbers, services)
- [x] Customer mobile (scan, join, track, book)

### Phase 2 — Production Ready

- [ ] Twilio SMS — OTP delivery + queue notifications
- [ ] Payment integration (Stripe for cards, UPI for India)
- [ ] QR code generation + print/download
- [ ] Reviews and ratings (post-service)
- [ ] Push notifications (Firebase)
- [ ] Full reports with date-range filtering + CSV export
- [ ] Logo and avatar file upload (Cloudinary)
- [ ] Appointment calendar view (admin)

### Phase 3 — Growth & Scale

- [ ] SaaS subscription billing (Free/Pro/Enterprise plans)
- [ ] Multi-barber queue (each barber has independent queue)
- [ ] AI-based wait time prediction (ML model on historical data)
- [ ] Customer loyalty points
- [ ] WhatsApp Business API notifications
- [ ] Franchise / multi-shop owner accounts
- [ ] Mobile app (iOS/Android via Capacitor build)

---

## 11. Current Position in Roadmap

**We are at: Phase 1 complete, starting Phase 2**

### What is done (demo-ready):
- Full queue flow: scan → join → track → serve ✅
- Admin can manage entire shop operation ✅
- Customer can book appointments ✅
- Queue display kiosk works with animations ✅
- GraphQL API covers all core operations ✅

### What is next (Phase 2 priorities):
1. **Twilio SMS** — configure credentials, remove dev-only static OTP
2. **QR code generation** — admin generates printable QR per shop/barber
3. **Payments** — post-service payment flow (Stripe)
4. **Reviews** — customer rates barber after SERVED

### Not blocking demo, but needed before production:
- File uploads (logo, barber avatar currently URL-only)
- Email notifications
- Error monitoring (Sentry)
- Rate limiting on GraphQL mutations

---

## 12. Developer Checklists

### Backend Checklist

- [x] All core resolvers implemented
- [x] `class-validator` on all DTOs (`@IsString()`, `@IsUUID()`, etc.)
- [x] `GqlJwtGuard` on all authenticated resolvers
- [x] `RolesGuard` + `@Roles()` on owner/admin endpoints
- [x] `TenantGuard` prevents cross-shop data access
- [x] `GlobalExceptionFilter` for consistent error format
- [x] Prisma indexes on hot-path tables (QueueEntry, QrCode, OtpRequest)
- [ ] Rate limiting on `requestOtp` mutation (prevent SMS spam)
- [ ] Twilio credentials wired in prod
- [ ] Stripe integration complete
- [ ] All services emit `NotificationService.dispatch()` on key events
- [ ] `AnalyticsSnapshot` nightly job (BullMQ)

### Admin Dashboard Checklist

- [x] AuthGuard on all protected routes
- [x] JWT injected via `AuthTokenInterceptor`
- [x] Queue monitor with live WebSocket subscription
- [x] Loading states on all data tables
- [x] Error handling via global interceptor + PrimeNG toast
- [x] PrimeNG toast visibility fixed (light backgrounds override dark theme)
- [ ] Calendar view for bookings
- [ ] Reports date-range filter
- [ ] QR code download page
- [ ] Finance page wired to API

### Customer Mobile Checklist

- [x] Apollo `query()` used (not `watchQuery().valueChanges`) on all read operations
- [x] `forkJoin` for parallel data load on shop landing
- [x] Loading skeleton states on shop landing
- [x] Live tracker subscription active
- [x] Book appointment multi-service + custom date/time
- [x] Guest booking works without login
- [ ] Logged-in user flow (JWT-based, not guest)
- [ ] Payment screen
- [ ] Review/rating after served
- [ ] History page wired to API

### Demo Checklist

- [x] Backend runs on localhost:3000
- [x] Admin dashboard loads at localhost:4201
- [x] Admin can log in (admin / admin123)
- [x] Queue monitor shows live entries
- [x] Customer mobile loads at localhost:4300
- [x] Shop landing page loads (`/shop/elite-barber-lounge`)
- [x] Customer can join queue (guest)
- [x] Live tracker updates in real time
- [x] Queue display kiosk works at localhost:4400
- [x] Appointment booking flow completes
- [ ] OTP SMS delivery (requires Twilio config)

---

## 13. Known Limitations

### Demo / Development Only

| Limitation | Location | Fix needed |
|---|---|---|
| Static OTP `123456` | `auth.service.ts` + `.env DEV_STATIC_OTP` | Wire Twilio in production |
| No SMS delivery | `NotificationService` (SMS channel stub) | Configure Twilio credentials |
| Barber avatars are URLs only | `book-appointment`, barber list | Add Cloudinary upload |
| Seed data has hardcoded names | `prisma/seed.ts` | Update seed for your shop |
| No payment flow | Customer mobile | Phase 2 work |
| `graphql-ws` subscription needs WSS in production | `main.ts` socket setup | Configure SSL/proxy |

### Architecture Gaps

- **Multi-barber queue:** Currently all entries share one shop queue. True per-barber isolation needs `barberId` filters consistently applied everywhere.
- **Appointment → Queue conversion:** Admin must manually convert an appointment to a queue entry (no auto-queue on appointment day).
- **Position on load:** Customer mobile shows position from last server fetch — subscription keeps it live, but if socket disconnects, position can be stale until reconnect.
- **Offline support:** No PWA caching — requires internet connection throughout.

---

## 14. Future Improvements

### Notifications

- [ ] WhatsApp Business API (preferred channel for India/Southeast Asia)
- [ ] Firebase push notifications (for installed Capacitor app)
- [ ] Email confirmations for appointments (SendGrid)

### Intelligence

- [ ] ML-based EWT: train on historical serve times per barber for smarter estimates
- [ ] Peak hour prediction: warn customers before joining during busy slots
- [ ] Smart scheduling: auto-suggest best booking slot based on historical wait patterns

### Customer Experience

- [ ] No-show prevention: SMS reminder 10 min before called position
- [ ] Loyalty points: earn points per visit, redeem for discounts
- [ ] Queue sharing: share your ticket link with friends
- [ ] Favourite barbers: customer saves preferred barber

### Operations

- [ ] Barber mobile view: dedicated Ionic app for barbers to manage their queue from phone
- [ ] Bulk import services via CSV
- [ ] QR code campaigns (different QR per promotion)
- [ ] Multi-language support (i18n)

### Platform

- [ ] Native iOS/Android app (Capacitor build from existing Ionic code)
- [ ] Offline-capable PWA (service worker, queue join works without internet)
- [ ] Webhook support (notify external systems on queue events)

---

*Last updated: April 2026 | QueueCut/TrimTime — Phase 1 complete*
