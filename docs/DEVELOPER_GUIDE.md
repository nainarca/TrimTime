# Developer Guide

## Project Layout
- `apps/api`: GraphQL backend with NestJS and Prisma.
- `apps/admin-dashboard`: Angular admin portal.
- `apps/customer-mobile`: Ionic mobile app.
- `apps/queue-display`: kiosk display app.
- `libs/`: shared types, utilities, and queue engine.
- `prisma/`: DB schema and migrations.
- `docs/`: developer and architecture docs.

## Nx Commands
- Serve projects:
  - `npx nx serve api`
  - `npx nx serve admin-dashboard`
  - `npx nx serve customer-mobile`
  - `npx nx serve queue-display`
- Build project: `npx nx build <project>`
- Lint: `npx nx lint <project>`
- Test: `npx nx test <project>`

## Development Workflow
1. Start API.
2. Start frontend(s).
3. Validate GraphQL queries via Playground.
4. Add or update graphQL and frontend services.
5. Run e2e manual checks.

## Useful Tips
- Keep schema in `libs/shared-types` to reuse across apps.
- For GraphQL errors, inspect the NestJS resolver logs and schema introspection.
- For queue behavior, inspect `apps/api/src/modules/queue` and `libs/queue-engine`.
