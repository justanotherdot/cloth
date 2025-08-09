# Cloth

Minimal feature flag service with experimentation capabilities.

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

## Status: LIVE and Deployed! 🚀

**✅ Production URLs:**
- **API**: https://cloth-api.justanotherdot.workers.dev
- **Frontend**: https://5061005f.cloth-frontend.pages.dev (Remix SPA + Radix UI)

All 5 critical foundations from `docs/foundations.md` are complete and **deployed**:

1. **✅ Workspace restructure** - `cloth-core` + `cloth-api` + testing structure
2. **✅ WASM build pipeline** - `worker-build` with `wee_alloc` optimization 
3. **✅ Testing harness** - Unit tests (core) + integration tests (API) + E2E tests (Playwright)
4. **✅ Local development** - `bin/dev` script with `wrangler dev` + frontend proxy
5. **✅ CI/CD pipeline** - GitHub Actions testing + Cloudflare native CD
6. **✅ KV Storage** - Namespaces created and bound
7. **✅ Smoke tests** - All passing on live deployment

**Ready for feature development!** 🚀

## Documentation

- `docs/architecture.md` - System overview and components
- `docs/roadmap.md` - Feature development timeline
- `docs/foundations.md` - Foundational work and implementation order
- `docs/testing-strategy.md` - Multi-layered testing approach
- `docs/adr/` - Architecture Decision Records
- `docs/tech-radar.md` - Technology choices and evaluation
