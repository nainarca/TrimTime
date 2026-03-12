# AI Development History

TrimTime was developed with significant assistance from AI tools. The following timeline outlines key stages and issues encountered.

## Tools used
- Cursor AI
- Claude Code (OpenAI)
- GitHub Copilot (internal)

## Project generation

The initial Nx monorepo and NestJS backend were scaffolded using generative prompts. AI produced:
- `nx.json`, `workspace.json`, project structure.
- Basic NestJS modules (`auth`, `users`, `shops`, `queue`).

Prisma schema was drafted by AI based on model descriptions (User, Shop, QueueEntry, etc.). Subsequent migrations were generated automatically.

Resolvers and services were created using code suggestions, saving time writing boilerplate CRUD.

## Issues encountered & solutions

- **Docker not running**: AI suggested verifying Docker Desktop status and retrying `docker-compose up`.
- **DATABASE_URL missing**: error appeared; AI recommended creating `.env` with a valid PostgreSQL connection string.
- **Prisma migration errors**: AI guided editing schema and running `npx prisma migrate dev`.
- **bcrypt missing**: build errors flagged missing import; AI fixed by adding `import * as bcrypt from 'bcrypt';`.
- **TypeScript schema mismatch**: resolver casts (`as Promise<UserModel>`) caused errors; AI adjusted to `as unknown as Promise<UserModel>`.
- **GraphQL DTO mismatch**: phone field missing in `CreateShopInput`; AI added nullable field and fixed service.
- **Prisma relation name change**: earlier mismatch `roleAssignments` vs `roles`; AI updated references and generated summary.
- **Unique key rename**: switched to `unique_user_role_shop` in upsert queries.

AI enabled numerous small refactors, enforcing type safety and automating repetitive tasks, which accelerated development and reduced manual debugging.

## Summary

Using AI transformed TrimTime's codebase from a conceptual design to a working system. It handled bootstrapping, schema design, resolver scaffolding, and even complex queue logic via library suggestions. The documented issues highlight the iterative nature of the project and the value of AI in spotting and resolving integration mismatches.