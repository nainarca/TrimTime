# System Architecture

## System Overview

TrimTime is a smart queue management system tailored for barber shops. Customers can join a queue via mobile/QR, barbers and owners manage flow, and a display screen shows live status. The backend provides a GraphQL API, authentication, and a Redis-based queue engine.

## High-Level Architecture

```
+-----------------+        +------------------+     +------------------+
|  Client Apps    | <----> |  Backend API     | <-> | PostgreSQL DB    |
| (Web/Mobile/    |        | (NestJS/GraphQL) |     | (Prisma ORM)     |
|  Display Screen)|        +------------------+     +------------------+
|                 |               |
|                 |               v
|                 |        +------------------+
|                 |        | Redis Queue      |
+-----------------+        | Engine / Caches  |
                            +------------------+
```

## Nx Monorepo Structure

- `apps/` - contains `api`, `admin-dashboard`, `customer-mobile`, `queue-display`.
- `libs/` - shared libraries (types, utils, queue-engine, auth, etc).
- `prisma/` - database schema, migrations, seed script.
- `docker/` - container configurations.

Nx orchestrates builds, linting, and testing across all projects.

## Backend Architecture

- **NestJS modules**: `auth`, `users`, `shops`, `queue`, `redis`, and more.
- Each module has service, resolver, DTOs, and Prisma interactions.
- PrismaService wraps the generated client.
- `RedisService` wraps ioredis for pub/sub and counters.

## Authentication System

- OTP-based login using phone numbers.
- JWT access and refresh tokens stored in Redis.
- Roles enforced via `UserRoleAssignment` and a custom `RolesGuard`.
- GraphQL guard `GqlJwtGuard` secures queries/mutations.

## Queue Engine Design

- Core logic lives in `@trimtime/queue-engine` library.
- Ticket numbers generated via Redis `INCR` per shop/day.
- Position sorting and estimated wait time (EWT) calculated in service.
- Transitions validated and published via GraphQL subscriptions.

## GraphQL API Architecture

- Resolvers mirror NestJS modules.
- Queries, mutations, subscriptions defined with TypeScript return types.
- DTOs (GraphQL inputs) provide validation with `class-validator`.

## Redis Usage

- Ticket counter keys: `ticketCounter:shopId:YYYY-MM-DD` with TTL.
- PubSub events broadcast queue updates.
- Refresh tokens and OTP locks stored as strings.

## Deployment Architecture

In production, the API runs behind a load‑balancer. PostgreSQL and Redis are deployed as managed services or containers. Static client apps are built and hosted via CDN.

## Scaling Strategy

- **API**: Scale horizontally using Nx-built Docker images.
- **Database**: Use read replicas; Prisma handles connection pooling.
- **Redis**: Clustered for high availability; use separate instances for pub/sub and caching.
- **Queue engine**: Stateless service logic; Redis counters ensure atomic ticket generation.

ASCII diagrams in this document give a visual overview of component interactions.