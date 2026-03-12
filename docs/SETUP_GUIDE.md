# TrimTime Setup Guide

This document walks a new developer through getting the entire TrimTime codebase running locally. The project is an Nx monorepo with a NestJS backend and various client apps planned.

---
## Prerequisites

1. **Git** – clone the repository.
2. **Node.js** – use the version specified in `package.json` (look for `engines.node`).
   ```sh
   # example using nvm
   nvm install 18
   nvm use 18
   ```
3. **Docker** – required for PostgreSQL and Redis containers.
4. **npm** or **yarn** (the repo uses npm by default).

---
## Clone the repository

```sh
git clone https://<your-repo-url>.git
cd Queuecut
```

---
## Install dependencies

From the workspace root:

```sh
npm install
```

or

```sh
yarn install
```

Nx will install packages for all apps and libs.

---
## Environment variables

Create a `.env` file in the project root (copy `.env.example` if present) and set at minimum:

```
DATABASE_URL=postgresql://user:password@localhost:5432/trimtime
REDIS_URL=redis://localhost:6379
JWT_SECRET=your_secret
JWT_REFRESH_SECRET=your_refresh_secret
```

Other values (OTP_TTL_SECONDS, etc.) have defaults.

---
## Start PostgreSQL and Redis

The easiest way is via Docker Compose provided in the repo:

```sh
docker-compose up -d postgres redis
```

This will launch containers using the `docker/*` configuration.

Alternatively, run standalone containers:

```sh
docker run --name trimtime-postgres -e POSTGRES_PASSWORD=pass -p 5432:5432 -d postgres:15

docker run --name trimtime-redis -p 6379:6379 -d redis:7
```

---
## Run Prisma migrations & seed

From the workspace root:

```sh
npx prisma migrate deploy    # apply migrations
npx prisma db seed           # populate initial data
```

The `seed.ts` script inserts plans, an admin user, etc.

---
## Build the API

Use Nx CLI to build the backend project:

```sh
npx nx build api
```

(On Windows you may need to prefix with `cmd /c`.)

---
## Run the backend

From the workspace root:

```sh
npx nx serve api
```

This starts the NestJS server (listens on port 3333 by default).

---
## Access GraphQL playground

Open your browser and go to:

```
http://localhost:3333/graphql
```

Use the interactive UI to explore queries, mutations, and subscriptions.

---

You now have a working local development environment for the TrimTime API. Client apps (admin dashboard, mobile, queue display) are handled in their respective subprojects and follow standard Angular/Ionic build commands.