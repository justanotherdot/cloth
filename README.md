# Cloth

Minimal feature flag service with experimentation capabilities.

## Architecture

- **API**: Rust Workers on Cloudflare Workers with KV storage
- **Frontend**: React/Vite on Cloudflare Pages  
- **Deployment**: Single atomic command via Wrangler

## Quick start

```sh
# Deploy everything
bin/deploy

# Run tests
bin/test

# Smoke test deployed services
bin/smoke-test
```

## Development

```sh
# Start API dev server
cd api && npm run dev

# Start frontend dev server  
cd frontend && npm run dev
```

## Documentation

- `docs/architecture.md` - System overview and components
- `docs/roadmap.md` - Feature development timeline
- `docs/foundations.md` - Foundational work and implementation order
- `docs/testing-strategy.md` - Multi-layered testing approach
- `docs/adr/` - Architecture Decision Records
- `docs/tech-radar.md` - Technology choices and evaluation
