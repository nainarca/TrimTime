# Troubleshooting Guide

This document lists common problems and how to solve them when developing or running TrimTime.

## Docker errors
- **`docker: command not found`** – ensure Docker Desktop is installed and added to PATH.
- **Containers not starting** – run `docker-compose ps` and inspect logs with `docker-compose logs postgres` or redis.
- **Permission issues on Windows** – run terminal as Administrator.

## Database connection failures
- **`Error: Database URL not found`** – check `.env` file for `DATABASE_URL`.
- **`prisma migrate dev` fails** – make sure PostgreSQL container is running and accept migrations with `npx prisma migrate deploy`.
- **Invalid credentials** – verify username/password in connection string.

## Prisma migration issues
- **Schema changes not applied** – run `npx prisma migrate dev --name <desc>` or `npx prisma migrate deploy`.
- **Type errors after schema update** – regenerate client with `npx prisma generate`.
- **Unique constraint violations during seed** – clear database or adjust seed data keys.

## GraphQL schema errors
- **`Field "phone" is not defined`** – add missing fields to DTOs (`create-shop.input.ts`).
- **Bad resolver return type** – cast to `unknown` or update expected type.
- **Authentication errors** – ensure JWT header `Authorization: Bearer <token>` is supplied.

## TypeScript compilation errors
- **Missing properties in Prisma include** – use correct relation names (`roles` vs `userRoleAssignments`).
- **TS2322 in create operations** – add required fields or fix input type.
- **`Object literal may only specify known properties`** – adjust query/update object to match generated types.

## Missing dependencies
- **`Cannot find module 'bcrypt'`** – install via `npm install bcrypt` and add appropriate import.
- **`@nestjs/common` or other packages missing** – run `npm install` at workspace root.

## Miscellaneous
- **`nx: command not found`** – install Nx globally or use `npx nx`.
- **GraphQL playground not loading** – check server logs for startup errors; ensure port 3333 is available.

If you encounter an error not listed here, reviewing recent Git changes and running the build command (`npx nx build api`) often reveals the source. The docs in `/docs` further clarify architecture and setup. Reach out to the team for persistent issues.