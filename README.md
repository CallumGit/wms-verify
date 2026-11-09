# WMS Verify

A warehouse management system for shipment verification, built with **NestJS** (backend API) and **React Native + Expo** (Android mobile app).

Operators verify pallets on the warehouse floor by scanning barcodes/QR codes, running on-device OCR on metal engravings, and matching everything against orders in the database. The system handles offline scenarios, automatic sync, and generates PDF/XLSX reports.

## Tech Stack

**Backend:** Node.js, NestJS, TypeScript (strict), PostgreSQL, Prisma ORM, Redis + BullMQ, JWT + RBAC, Swagger/OpenAPI

**Mobile:** React Native, Expo, TypeScript, ML Kit (barcode + OCR), TanStack React Query, expo-sqlite (offline), react-hook-form + zod

**Infrastructure:** Docker + docker-compose, GitHub Actions CI/CD, EAS Build (Android APK/AAB)

## Repository Structure

```
wms-verify/
├── apps/
│   ├── api/              # NestJS backend (REST API)
│   └── mobile/           # React Native + Expo (Android)
├── packages/
│   ├── core/             # Pure domain logic (parser, validation rules)
│   ├── types/            # Shared types (generated from Prisma + DTOs)
│   └── config/           # Shared ESLint/TS config
├── prisma/               # Database schema + migrations + seed
├── load-tests/           # k6 load/spike test scripts
├── docker-compose.yml    # Dev: PostgreSQL + Redis
└── docker-compose.prod.yml  # Production deployment
```

## Key Features

- **Barcode/QR scanning** with ML Kit (offline, on-device)
- **OCR for metal engravings** (dot-peen) with manual fallback
- **Role-based access control** (Admin, Supervisor, Team Leader, Operator)
- **Atomic order locking** to prevent concurrent verification conflicts
- **Idempotent verification** via `clientGeneratedId` (safe offline sync)
- **Offline-first mobile** with local SQLite storage and automatic sync
- **PDF and XLSX report generation** (on demand + scheduled via BullMQ)
- **Customer/material number parsing** with domain-specific validation rules

## Getting Started

### Prerequisites

- Node.js >= 20
- Docker + Docker Compose
- Android Studio (for mobile development)
- JDK 17 (Temurin)

### Backend Setup

```bash
# 1. Clone and install
git clone https://github.com/CallumGit/wms-verify.git
cd wms-verify
npm install

# 2. Copy environment config
cp .env.example .env

# 3. Start PostgreSQL + Redis
docker compose up -d

# 4. Run migrations and seed test data
npm run prisma:migrate
npm run prisma:seed

# 5. Start the API (localhost:3000)
npm run start:dev --workspace apps/api
```

### Verify It Works

```bash
curl http://localhost:3000/api/health
# {"status":"ok","database":"up",...}
```

**Swagger UI:** [http://localhost:3000/api/docs](http://localhost:3000/api/docs)

### Mobile Setup

```bash
# First time (generates native Android project)
npx expo prebuild --platform android
npx expo run:android

# Daily development (JS changes only)
npx expo start
```

## API Overview

| Module | Endpoints | Access |
|--------|-----------|--------|
| Auth | Login, refresh, change password | Public / Logged in |
| Orders | CRUD, status changes, shipping | Varies by role |
| Lock | Acquire, heartbeat, release | Any logged-in user |
| Verification | Verify pallet, history | Any logged-in user |
| Users | CRUD, password reset | Admin only |
| Customers | CRUD | Admin/Supervisor create; all read |
| Materials | CRUD | Admin/Supervisor create; all read |
| Reports | PDF/XLSX generation | Admin/Supervisor |
| Schedules | Automated report scheduling | Admin/Supervisor |

Full API documentation available at `/api/docs` (Swagger UI) when the server is running.

### Test Accounts (dev seed)

| Role | Username | Password |
|------|----------|----------|
| Admin | admin | admin123 |
| Supervisor | supervisor | supervisor123 |
| Team Leader | lider1 | lider1123 |
| Operator | oper1 | oper1123 |

## Testing

```bash
# Unit tests (packages/core)
npm run test:core

# API integration tests
npm run test:api

# Load tests (k6)
cd load-tests && k6 run load-test.js
```

There is also a dedicated [Playwright API test framework](https://github.com/CallumGit/wms-api-test-framework) built against this application, covering auth matrix, RBAC, lock race conditions, idempotent verification, and input validation.

## Architecture Decisions

- **Monorepo with shared packages** keeps domain logic (`packages/core`) framework-agnostic and fully unit-testable, shared between backend and mobile
- **Idempotent writes** via `clientGeneratedId` allow safe retry from unreliable mobile connections
- **Atomic locking** (fixed in Area 27) prevents two operators from verifying the same order simultaneously
- **Offline-first** design with local SQLite means operators can work without network; sync happens automatically when connectivity returns

## License

This project is not currently licensed for redistribution. All rights reserved.
