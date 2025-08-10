# Cloth

A minimal feature flag service designed for experimentation and gradual rollouts.

## Architecture

**Dual Worker Setup:**
- **API Worker**: Rust + WASM backend with HTTP Basic Auth (`packages/api/`)
- **Frontend Worker**: Static asset serving for Remix UI (`packages/frontend/`)
- **Storage**: Cloudflare KV for flag persistence  
- **Authentication**: HTTP Basic Auth protects API control plane
- **Public Access**: Flag evaluation endpoint (`/api/flags/:key/evaluate`) has no auth

## Quick start

```sh
# Run pre-deployment tests
bin/test

# Deploy everything
bin/deploy

# Smoke test deployed services
bin/test-smoke
```

## Development

```sh
# Start both Workers for local development
bin/dev

# Services will be available at:
# - Frontend: http://localhost:3000 
# - API: http://localhost:8787
# Authentication: admin / dev123
```

## Monorepo Structure

```
cloth/
├── packages/
│   ├── api/              # API Worker (Rust + WASM)
│   └── frontend/         # Frontend Worker (static assets)
├── apps/
│   └── ui/               # Remix application
├── cloth-core/           # Shared Rust library  
└── tests/e2e/            # End-to-end tests
```

## Production deployment

**Live services:**
- **API Worker**: https://cloth-api.justanotherdot.workers.dev
- **Frontend Worker**: https://cloth-frontend.justanotherdot.workers.dev  
- **Authentication**: admin / [set AUTH_PASSWORD in CF dashboard]
- **Public evaluation**: `/api/flags/{key}/evaluate` (no auth required)

**Infrastructure status:**

- Dual Worker architecture following Cloudflare best practices
- HTTP Basic Auth protecting API control plane  
- WASM build pipeline operational
- Comprehensive testing harness updated
- Local development environment configured
- **CI/CD pipeline with automated deployments** 
- KV storage namespaces provisioned
- Monorepo structure with npm workspaces

The service is ready for feature development with secure access controls and automated deployments.

## Documentation

- `docs/deployment.md` - GitHub Actions CD setup and deployment guide
- `docs/architecture.md` - System overview and components
- `docs/roadmap.md` - Feature development timeline
- `docs/foundations.md` - Foundational work and implementation order
- `docs/testing-strategy.md` - Multi-layered testing approach
- `docs/adr/` - Architecture Decision Records
- `docs/tech-radar.md` - Technology choices and evaluation
