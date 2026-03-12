# TrimTime

TrimTime is a smart queue management system designed for barber shops. It enables customers to join queues via mobile or kiosk, allows barbers and owners to manage live queues, and powers display screens showing real-time status.

## System Purpose

The application streamlines the check‑in and service process at salons by providing digital queue handling, estimated wait times, role-based access, and real-time updates. It is intended to reduce customer frustration and increase operational efficiency.

## Technology Stack

- **Monorepo:** Nx workspace
- **Backend:** NestJS, GraphQL, Prisma ORM, PostgreSQL
- **Queue Engine:** Custom TypeScript library with Redis counters
- **Caching & PubSub:** Redis
- **Authentication:** JWT with OTP login
- **Frontend (planned):** Angular admin dashboard, Ionic mobile app, queue display screen

## Quick Setup

1. Clone the repository:
   ```sh
   git clone https://<your-repo-url>.git
   cd Queuecut
   ```
2. Install dependencies:
   ```sh
   npm install
   ```
3. Copy or create `.env` with required environment variables (see `/docs/SETUP_GUIDE.md`).
4. Start PostgreSQL and Redis (Docker Compose provided).
5. Run Prisma migrations and seed the database:
   ```sh
   npx prisma migrate deploy
   npx prisma db seed
   ```
6. Build and serve the API:
   ```sh
   npx nx build api
   npx nx serve api
   ```
7. Open GraphQL playground at `http://localhost:3333/graphql`.

For full setup details, refer to the `docs/SETUP_GUIDE.md` document.

## Architecture Overview

The backend API communicates with PostgreSQL via Prisma and uses Redis for queue counters and pub/sub. Client applications interact through a GraphQL endpoint secured with JWTs. The queue engine library handles ticketing, position sorting, and estimated wait time calculations. See `docs/SYSTEM_ARCHITECTURE.md` for diagrams and deeper explanation.

## Documentation

Comprehensive technical documentation is available in the `docs/` directory:

- `SETUP_GUIDE.md` – Environment setup
- `SYSTEM_ARCHITECTURE.md` – Architecture and components
- `API_REFERENCE.md` – GraphQL API endpoints
- `DATABASE_SCHEMA.md` – Prisma models and ER diagram
- `QUEUE_ENGINE_DESIGN.md` – Queue subsystem design
- `AI_DEVELOPMENT_HISTORY.md` – Development notes
- `TROUBLESHOOTING.md` – Common issues

## Contribution Guidelines

1. Fork the repository and create a feature branch.
2. Follow existing coding conventions and run linting/tests (`npx nx lint`, `npx nx test`).
3. Write clear commit messages and update documentation as needed.
4. Submit a pull request describing your changes and any setup steps.

We welcome contributions that improve functionality, performance, and developer experience.

---
TrimTime is actively developed and maintained. Join us in building the next generation of salon queue management!