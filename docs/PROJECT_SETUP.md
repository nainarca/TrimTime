# Project Setup

This document describes how to install and prepare QueueCut for local development.

## Prerequisites
- Node.js (>= 20)
- npm
- Nx CLI: `npm install -g nx`
- PostgreSQL
- Redis

## Install dependencies
```bash
cd Queuecut
npm install
```

## Setup environment
Copy `.env.example` to `.env` and update database and redis settings.

## Run Prisma migrations
```bash
npx prisma migrate dev
```

## Seed the database
```bash
npx prisma db seed
```

## Start Docker (optional)
```bash
docker-compose -f docker-compose.dev.yml up -d
```
