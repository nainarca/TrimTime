
# TrimTime / QueueCut – Developer Setup Guide

This document explains the **project architecture, setup steps, issues encountered, and AI prompts used during development**.  
It allows new developers to **run the project independently without relying on chat history**.

---

# 1. Project Overview

TrimTime is a **Smart Queue Management System for Barber Shops**.

Main Features:

- Customer OTP Login
- Live Queue Tracking
- Barber Shop Management
- Ticket Generation
- Real-time Queue Updates
- Admin Dashboard
- Multi‑Shop Support

---

# 2. Technology Stack

Backend
- NestJS
- GraphQL
- Prisma ORM
- PostgreSQL
- Redis

Architecture
- Nx Monorepo

Dev Tools
- Docker
- Claude AI
- Cursor AI

Frontend (Next Phase)
- Angular Admin Dashboard
- Ionic Customer Mobile App
- Queue Display Screen

---

# 3. Project Folder Structure

Queuecut/

apps/
api/ → NestJS Backend
src/
modules/
auth/
users/
shops/
queue/

libs/
Shared libraries

prisma/
schema.prisma
seed.ts

docker-compose.dev.yml
nx.json
package.json

---

# 4. Clone Project

git clone https://github.com/nainarca/TrimTime.git

cd Queuecut

---

# 5. Install Dependencies

npm install

If bcrypt missing:

npm install bcrypt
npm install -D @types/bcrypt

---

# 6. Environment Setup

Create `.env`

DATABASE_URL="postgresql://trimtime_user:trimtime_pass@localhost:5432/trimtime_dev"

JWT_SECRET="supersecret"

REDIS_HOST="localhost"
REDIS_PORT=6379

---

# 7. Start Database

npm run docker:up

This starts

PostgreSQL
Redis

---

# 8. Run Migration

npm run prisma:migrate

Migration name:

init

---

# 9. Generate Prisma Client

npm run prisma:generate

---

# 10. Seed Database

npm run prisma:seed

Creates

Admin user
Default shop
Subscription plans

---

# 11. Build API

npx nx build api

Expected result

NX Successfully ran target build for project api

---

# 12. Start API

npm run start:api

Open

http://localhost:3000/graphql

---

# 13. Backend Modules

Auth Module

Handles
OTP login
JWT authentication

Files
auth.service.ts
auth.resolver.ts
jwt.strategy.ts

Users Module

Handles
user profiles
role management

Shops Module

Handles
shop creation
branches
ownership

Queue Module

Handles
join queue
ticket creation
queue tracking

---

# 14. Queue Flow

Customer scans QR

Login with OTP

Join queue

Get ticket

Track live queue

---

# 15. AI Prompts Used

Fix Prisma Type Errors

"Fix Prisma schema mismatches between NestJS services and Prisma models.
Ensure required fields exist but do not change business logic."

Fix GraphQL DTO errors

"Update GraphQL DTO classes so they match Prisma schema.
Add missing fields with nullable true."

Fix Queue Subscription

"Replace pubSub.asyncIterableIterator with pubSub.asyncIterator."

Fix ShopCreateInput

"The build fails because ShopCreateInput requires phone.
Add phone field to CreateShopInput DTO."

---

# 16. Issues Encountered

Issue 1
DATABASE_URL missing

Fix
Create .env

Issue 2
Docker not running

Fix
Start Docker Desktop

Issue 3
Seed script failure

Fix
Create shop before role assignment

Issue 4
bcrypt module missing

Fix

npm install bcrypt

Issue 5
Prisma relation mismatch

roleAssignments → userRoleAssignments

Issue 6
CreateShopInput missing phone

Add phone field to DTO

---

# 17. Helpful Commands

Start API

npm run start:api

Build API

npx nx build api

Run migration

npm run prisma:migrate

Reset database

npm run prisma:reset

Open Prisma Studio

npm run prisma:studio

---

# 18. GraphQL Test

mutation {
requestOtp(phone: "+919999999999")
}

---

# 19. Next Development

Admin Dashboard
Customer Mobile App
Queue Display

---

# 20. Summary

Backend Completed

Nx Architecture
NestJS API
Prisma ORM
Redis Queue Engine

Next Step

Frontend development

