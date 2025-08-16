# Cloth

A feature flag management system built on Cloudflare Workers with React frontend. Designed as a template for clean, layered architecture patterns.

## Quick Start

```sh
npm install
./bin/dev
# Visit http://localhost:8787
```

## Architecture

Clean layered design with type-safe contracts:

```
Frontend (React + TanStack Query) → Service (HTTP API) → Core (Business Logic) ← Storage (Durable Objects)
```

- Pure API client functions (framework agnostic)
- Shared TypeScript contracts between frontend/backend  
- TanStack Query for declarative data fetching
- Individual route handlers for clear API organization

## Development

```sh
./bin/dev        # Start local development
./bin/test       # Run tests  
./bin/check      # Type checking
./bin/lint       # Code linting
./bin/format     # Code formatting
./bin/build      # Production build
./bin/deploy     # Deploy to Cloudflare
```

## Template Usage

This project serves as a template for similar Cloudflare Workers applications. The architecture patterns can be adapted for different domains (users, orders, etc.).

## Documentation

Comprehensive guides available in [`docs/`](./docs/):

- [Architecture](./docs/architecture.md) - Design patterns and decisions
- [Development](./docs/development.md) - Workflow and troubleshooting  
- [Template Usage](./docs/template-usage.md) - Adaptation guide
- [Multi-tenancy](./docs/multi-tenancy.md) - Multi-tenant design

## Key Technologies

**Backend:** Cloudflare Workers, Hono, Durable Objects, TypeScript  
**Frontend:** React, TanStack Query, Tailwind CSS, Vite