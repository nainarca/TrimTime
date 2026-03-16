# QueueCut Project Overview

QueueCut is a smart queue management system for barber shops. It centralizes queue handling for customers, barbers, and store owners, with real-time updates and display screens.

## What QueueCut Is
QueueCut enables customers to join a barber queue using mobile or kiosk, tracks wait time, and gives barbers real-time queue operations with a management dashboard.

## Main Features

### Customer Features
- Scan shop QR code to open a shop page
- Join queue for selected service and branch
- Track queue position, status, and estimated wait

### Barber Features
- Manage services and service durations
- Call next customer from queue
- Mark served, no-show, and update entry statuses

### Admin Features
- Manage shop settings and branches
- Manage barbers and service catalog
- View queue and daily report analytics

### Queue Display
- Fullscreen now-servicing view
- Next customer and waiting list
- Live updates via GraphQL subscriptions

## System Purpose
QueueCut improves salon throughput by replacing manual ticket queues with a real-time digital queue engine.

## Key Modules
- `apps/api`: GraphQL backend (NestJS + Prisma)
- `apps/admin-dashboard`: Angular admin portal
- `apps/customer-mobile`: Ionic customer app
- `apps/queue-display`: Angular kiosk display
- `libs/`: shared modules and queue engine utilities
