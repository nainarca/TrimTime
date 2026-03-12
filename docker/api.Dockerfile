# ============================================================
# TRIMTIME API — Multi-stage Dockerfile
# ============================================================

# ── Stage 1: Base ──────────────────────────────────────────
FROM node:20-alpine AS base
RUN apk add --no-cache libc6-compat openssl
WORKDIR /app
COPY package*.json ./
RUN npm ci --ignore-scripts

# ── Stage 2: Builder ───────────────────────────────────────
FROM base AS builder
COPY . .
# Generate Prisma client
RUN npx prisma generate --schema=prisma/schema.prisma
# Build the NestJS API
RUN npx nx build api --configuration=production

# ── Stage 3: Production ────────────────────────────────────
FROM node:20-alpine AS production
RUN apk add --no-cache openssl
WORKDIR /app

ENV NODE_ENV=production

# Copy production dependencies only
COPY package*.json ./
RUN npm ci --omit=dev --ignore-scripts

# Copy Prisma schema and generated client
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma

# Copy built application
COPY --from=builder /app/dist/apps/api ./dist

# Generate Prisma client for production
RUN npx prisma generate --schema=prisma/schema.prisma

# Create non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nestjs
USER nestjs

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/health || exit 1

CMD ["node", "dist/main.js"]
