# AtlasPayments WebUI

Dashboard and web interface for the Atlas payments platform. Provides a unified view across all Atlas services — Payments, Billing, Risk & Disputes, Treasury, and Platform — plus integrated EchoAtlas Observatory monitoring.

## Features

- **Estate Dashboard** — Bird's-eye view of all 5 services with live entity counts and health checks
- **Activity Feed** — Real-time event timeline, service breakdown, and endpoint map (272 operations)
- **API Governance** — Live endpoint health runner, Postman CLI commands, per-service workspace cards
- **Entity Views** — Customers, Payments, Refunds, Balance/Ledger, Webhooks with pagination
- **EchoAtlas Observatory** — Agent monitoring, query analytics, underground threat detection
- **Golden Path** — Visual guide to the Postman-driven API lifecycle
- **API Docs** — OpenAPI spec viewer with tag/endpoint summary
- **Auth** — NextAuth credentials login against EchoAtlas user database

## Getting Started

```bash
# Install dependencies
pnpm install

# Generate Prisma clients
pnpm prisma:generate

# Copy and configure environment
cp .env.example .env

# Start dev server
pnpm dev
```

## Environment Variables

| Variable | Description |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string for AtlasPayments data |
| `ECHOATLAS_DATABASE_URL` | PostgreSQL connection string for EchoAtlas data |
| `ECHOATLAS_API_KEY` | API key for EchoAtlas Observatory |
| `ECHOATLAS_BASE_URL` | EchoAtlas API base URL |
| `NEXTAUTH_SECRET` | NextAuth session encryption secret |
| `NEXTAUTH_URL` | Canonical URL of this app |

## Stack

- **Next.js 16** (App Router)
- **React 19** with React Compiler
- **Tailwind CSS 4** (PostCSS plugin)
- **Prisma** (PostgreSQL) — dual schema: main + EchoAtlas
- **NextAuth** (credentials provider)
- **Recharts** for data visualization
- **Lucide React** icons
