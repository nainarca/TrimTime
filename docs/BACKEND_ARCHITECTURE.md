# TrimTime Backend Architecture

This document provides a comprehensive overview of the backend system for TrimTime, a multi-tenant barber shop queue and management SaaS platform. Its purpose is to help new developers understand the system without reading the entire chat history or inspecting every file.

---
## 1. Project Overview

TrimTime is a software-as-a-service platform designed to help barber shops manage customer queues, branch operations and staff. Businesses create a shop and branches, customers join the queue via a mobile app or QR code, and barbers/owners control the process using an admin dashboard. The system supports multiple tenants (shops) on a single backend.

## 2. Business Flow

1. **Customer joins queue:** A guest or authenticated customer requests to join a queue at a shop/branch/barber. The backend allocates a ticket, tracks position and estimated wait time.
2. **Barber serves queue:** Barbers or owners update entry status (e.g., called, served, left) via dashboard actions. The queue engine updates in-memory/Redis state, publishes events.
3. **Dashboard monitoring:** Admin dashboard displays live queue stats, branch information, staff, and allows configuration.

The flow is supported by GraphQL mutations and subscriptions; Redis pub/sub pushes real-time updates to clients.

## 3. System Architecture

The codebase is organized as an Nx monorepo with the following high-level layout:

```
apps/             # executable applications, e.g. api, admin-dashboard, customer-mobile, queue-display
libs/             # shared libraries used by multiple apps (auth, queue-engine, shared-utils, etc.)
prisma/           # database schema, migrations and seed scripts
```

The backend API lives under `apps/api`, with modules corresponding to features. Shared code, types, and utilities are in `libs/*`.

## 4. Technology Stack

- **Nx Monorepo** – workspace for multiple projects
- **NestJS** – framework for server-side Node.js applications
- **GraphQL (Apollo)** – code-first GraphQL API
- **Prisma ORM** – type-safe database access to PostgreSQL
- **PostgreSQL** – relational database
- **Redis** – in-memory store used for queue state, OTP tracking, token storage and pub/sub
- **JWT Authentication** – access control via JSON Web Tokens and OTP login flow

## 5. Multi-Tenant Architecture

Multi-tenancy is achieved by associating every relevant record with a `shopId`. All queries and operations either automatically filter by `shopId` or are guarded:

- Prisma models include a `shopId` field for owned resources (branches, queue entries, roles, etc.).
- Services accept an optional `allowedShopIds` list derived from the authenticated user.
- `TenantGuard` checks that incoming operations reference a `shopId` the user is permitted to access.
- Redis keys are prefixed with `shopId` (`queue:{shopId}:...`, `ticketCounter:{shopId}`) to avoid conflicts.

This ensures one shop cannot see or modify another shop's data.

## 6. Database Models

Key Prisma models:

- **User** – represents a person with `id`, `phone`, optional `name`, and roles. Relationships: `roles` (UserRoleAssignment), `shop` (owner), `queueEntries`.
- **Shop** – business entity with `id`, `name`, `slug`, `country`, `currency`, etc. Owner is a User. Has many `branches` and `queueEntries`.
- **ShopBranch** – physical location. Contains `shopId`, `name`, `address`, etc. Has queue entries tied to a branch.
- **UserRoleAssignment** – mapping between a user, a role string, and a `shopId` to allow role-based access per shop. E.g., `SHOP_OWNER`, `BARBER`.
- **QueueEntry** – represents a customer in a queue with `shopId`, `branchId`, optional `barberId`, `status`, `ticketNumber`, `estimatedWait`, etc.

Relationships: a Shop has many ShopBranches; a ShopBranch belongs to a Shop. QueueEntries tie back to Shop, Branch, and optionally a User (customer or barber). Users may own a Shop and hold multiple role assignments across shops.

## 7. Authentication Flow

1. **Request OTP** – user supplies a phone number. Backend rates limits using Redis keys; generates/returns an OTP code (sent via SMS in production). New users are created automatically.
2. **Verify OTP** – user submits phone + OTP. If valid, backend creates (or finds) user and issues a JWT access token and a refresh token. Tokens are stored/cached in Redis.
3. **JWT usage** – clients include access token in `Authorization` header; GraphQL guard decodes and attaches user object (including `shopIds` array) to context. `refreshToken` mutation allows renewing tokens; `logout` revokes refresh token.

## 8. Tenant Security Layer

The `TenantGuard` is a NestJS guard applied alongside authentication for mutations and queries that involve a `shopId`. It inspects resolver arguments (`shopId` or `input.shopId`), fetches allowed `shopIds` from `req.user` and throws `ForbiddenException` if the shop is not permitted. This layer enforces per-tenant access control beyond role checks.

## 9. GraphQL Context

The GraphQL context is extended in `graphql.config.ts` such that after the JWT guard validates a token, the `user` object (including `id`, `phone`, and `shopIds`) is attached to `req`. Resolvers can then access the authenticated user via the `@CurrentUser()` decorator. `shopIds` are propagated into service methods for filtering.

## 10. Redis Queue System

Redis holds transient queue state and counters:

- **Ticket counter** – daily counter per shop (`ticketCounter:{shopId}:{date}`) to generate ticket numbers.
- **Queue state** – live queue entries stored under keys such as `queue:{shopId}`, `queue:{shopId}:branch:{branchId}`, or with an appended `:barber:{barberId}`. These keys support quick lookups and pub/sub.
- **Pub/Sub** – when queue changes occur, events are published on channels; subscriptions in GraphQL use a duplicated Redis client.

Helper methods in `RedisService` generate the correct key strings.

## 11. Backend Modules

- **auth** – handles OTP requests, token creation/verification, logout, guards (`GqlJwtGuard`, `TenantGuard`), and current-user decorator.
- **users** – user profile operations (fetch self, update profile), user lookup by phone, and role/activation management.
- **shops** – create/update shops, list branches, query by slug or owner, and branch management. Owner-only operations enforce roles and tenant guards.
- **queue** – core queue logic: joining a queue, updating status, leaving, and computing stats/positions via the `queue-engine` library. Communicates with Redis and emits pub/sub events.
- **database** – Prisma service wrapper.
- **redis** – Redis client with various helper functions for counters, session keys, and queue state.

## 12. Development Issues Encountered

Several challenges arose during backend development:

- **Prisma schema mismatches** – type names and relations (e.g., `roleAssignments` vs `userRoleAssignments`) caused compile errors; resolved by aligning code with schema and regenerating client.
- **TypeScript errors** – mismatched DTOs and model types surfaced during build; required adjustments to inputs, nullable fields, and explicit casts in resolvers.
- **Nx build errors** – running `npm run affected:build` revealed cross-project dependencies; fixing intermediate build steps and cleaning generated files resolved them.
- **Redis key conflicts** – initial key patterns lacked `shopId` prefix, which risked cross-tenant data leakage. The pattern was updated and RedisService helpers added appropriate prefixes.

These issues were ironed out through iterative searches, schema tweaks, and service updates.

## 13. Current Backend Status

Completed features checklist:

- [x] OTP + JWT authentication
- [x] User profile management
- [x] Shop creation & ownership
- [x] Multi-branch support
- [x] Queue operations (join, update, leave)
- [x] Real-time updates via Redis pub/sub
- [x] TenantGuard and shop-based access control
- [x] Role-based permissions (USER, SHOP_OWNER, BARBER)
- [x] Documentation (`/docs` directory)

## 14. Next Development Phase

The backend is feature-complete for core SaaS functionality. The next phase will focus on frontend applications and integration, with backend adjustments as needed.

## 15. Frontend Applications

- **admin-dashboard** – Angular app for shop owners and staff to manage queues, branches, services, and view statistics.
- **customer-mobile** – Ionic/Capacitor mobile application for customers to join queues and track their position.
- **queue-display** – a simple screen (TV/monitor) app that shows current queue status inside a shop.

These apps will consume the GraphQL API.

## 16. AI Development Workflow

AI tools were leveraged extensively:

- **Claude Code** – used for backend logic, refactoring, automated edits, and architectural design discussion in the development process.
- **Cursor AI** – utilized (planned) for generating frontend UI prototypes and components.

The AI-assisted workflow accelerated issue resolution and documentation.

## 17. Repository Structure

```
apps/
  api/                 # NestJS GraphQL backend
  admin-dashboard/     # Angular frontend
  customer-mobile/     # Ionic mobile app
  queue-display/       # simple display application
libs/
  auth/                # shared authentication utilities
  queue-engine/        # algorithmic logic for queue position/EWT
  shared-types/        # common TypeScript interfaces
  shared-utils/        # helpers (slug generation, formatting, etc.)
  ui-components/       # Angular components (front-end)
prisma/                # schema.prisma, migrations, seed script
```

Each module is an Nx project with its own tsconfig and build configuration.

## 18. Setup Instructions

To run the backend locally:

```bash
# install dependencies
npm install

# start Postgres and Redis (using Docker)
docker-compose up -d

# migrate database
npx prisma migrate dev --name init

# seed initial data
npx ts-node prisma/seed.ts

# build and start API
npm run affected:build -- --projects=api
npm run start:api
```

Access the GraphQL playground at `http://localhost:3333/graphql`.

## 19. Future Roadmap

Upcoming backend features:

- Staff management (assigning barbers, hours)
- Services management (haircut types, durations)
- Appointments support alongside queues
- Subscription plans and tenant billing
- Stripe integration for payments

## 20. Documentation Tone

This document is meant to be clear and developer-friendly. New team members should use it as a starting point before diving into specific code files.

---

*Generated by AI assistant; file path: `docs/BACKEND_ARCHITECTURE.md`.*
