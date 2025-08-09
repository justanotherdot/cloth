# Cloth

A minimal feature flag service designed for experimentation and gradual rollouts.

## Architecture

- **API**: Rust Workers on Cloudflare Workers with KV storage
- **Frontend**: Remix + Radix UI + Tailwind CSS on Cloudflare Pages  
- **Deployment**: Single atomic command via Wrangler

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
# Start API dev server (Workers)
bin/dev

# Start frontend dev server (separate terminal)
cd frontend && npm install && npm run dev
```

## Production deployment

**Live URLs:**
- **API**: https://cloth-api.justanotherdot.workers.dev
- **Frontend**: https://5061005f.cloth-frontend.pages.dev

**Infrastructure status:**

- Workspace restructure complete
- WASM build pipeline operational
- Comprehensive testing harness in place
- Local development environment configured
- CI/CD pipeline functional
- KV storage namespaces provisioned
- Smoke tests passing

The service is ready for feature development.

## Documentation

- `docs/architecture.md` - System overview and components
- `docs/roadmap.md` - Feature development timeline
- `docs/foundations.md` - Foundational work and implementation order
- `docs/testing-strategy.md` - Multi-layered testing approach
- `docs/adr/` - Architecture Decision Records
- `docs/tech-radar.md` - Technology choices and evaluation
