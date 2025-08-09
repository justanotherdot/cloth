# Foundations roadmap

## Overview

This document outlines the foundational work required before building Cloth's core functionality. These foundations enable fast iteration, confident deployment, and maintainable code.

## Critical foundations (must complete before features)

### 1. Workspace restructure
**Status**: Pending  
**Effort**: 1-2 days  
**Blocks**: All other work

**Current state**:
```
cloth-core/         # Business logic (keep)
cloth-service/      # Generic name (rename)
```

**Target state**:
```  
cloth-core/         # Shared business logic + types
cloth-api/          # Workers API (renamed from service)
frontend/           # React admin interface
tests/             # E2E and integration tests
```

**Tasks**:
- [ ] Rename `cloth-service` → `cloth-api`
- [ ] Update Cargo.toml workspace references
- [ ] Move any shared types to `cloth-core`
- [ ] Create proper module boundaries

### 2. WASM build pipeline  
**Status**: Pending  
**Effort**: 2-3 days  
**Blocks**: API development, testing

**Requirements**:
- Single Workers target (no multi-target complexity)
- Size optimization with `wee_alloc`
- Proper wrangler configuration
- Local development support

**Tasks**:
- [ ] Add `wasm-pack` configuration to `cloth-api`
- [ ] Configure `wee_alloc` for size optimization
- [ ] Create `wrangler.toml` for Workers deployment
- [ ] Set up local development with `wrangler dev`
- [ ] Add WASM build to workspace root

### 3. Testing harness
**Status**: Pending  
**Effort**: 3-4 days  
**Blocks**: Confident feature development

**Components needed**:
- Unit tests for `cloth-core` business logic
- Integration tests for `cloth-api` endpoints
- E2E tests for admin UI workflows
- Test environment setup/teardown

**Tasks**:
- [ ] Unit test framework for core evaluation logic
- [ ] Integration test setup with Workers runtime
- [ ] Playwright configuration for E2E testing
- [ ] Test KV namespace isolation
- [ ] Test data fixtures and helpers
- [ ] Coverage reporting setup

### 4. Local development environment
**Status**: Pending  
**Effort**: 1-2 days  
**Blocks**: Fast iteration cycles

**Requirements**:
- API development server (`wrangler dev`)
- Frontend development server with HMR
- Shared development configuration
- Mock data seeding

**Tasks**:
- [ ] `wrangler dev` configuration with proper ports
- [ ] Frontend dev server configuration
- [ ] Development flag seeding script
- [ ] Hot reload for both API and frontend
- [ ] Local HTTPS setup if needed

### 5. Basic CI/CD pipeline
**Status**: Pending  
**Effort**: 2-3 days  
**Blocks**: Team collaboration, deployment confidence

**Pipeline requirements**:
- Build validation (Rust + frontend)
- Test execution (unit + integration + E2E)
- Deployment automation
- Environment promotion

**Tasks**:
- [ ] GitHub Actions workflow setup
- [ ] Rust toolchain and WASM build
- [ ] Node.js setup for frontend and E2E tests
- [ ] Test execution with proper parallelization
- [ ] Deployment steps for Workers and Pages
- [ ] Environment variable management

## Supporting foundations (nice to have)

### 6. Code quality tools
**Status**: Future  
**Effort**: 1 day

**Tools**:
- `rustfmt` and `clippy` enforcement
- Frontend linting (ESLint + Prettier)
- Pre-commit hooks
- Dependency vulnerability scanning

### 7. Monitoring and observability  
**Status**: Future  
**Effort**: 2-3 days

**Requirements**:
- Request logging and metrics
- Error tracking and alerting
- Performance monitoring
- Usage analytics

### 8. Security hardening
**Status**: Future  
**Effort**: 2-3 days

**Requirements**:
- API key management
- CORS configuration
- Rate limiting
- Input validation

## Implementation order

### Phase 1: Core infrastructure (Week 1)
1. Workspace restructure → Enables proper organization
2. WASM build pipeline → Enables API development  
3. Local development → Enables fast iteration

### Phase 2: Quality assurance (Week 2)  
4. Testing harness → Enables confident development
5. Basic CI/CD → Enables team collaboration

### Phase 3: Feature development (Week 3+)
6. Core business logic implementation
7. API endpoints implementation
8. Admin UI implementation

## Success criteria

### Development velocity
- [ ] Local changes visible within 30 seconds
- [ ] Full test suite runs in under 5 minutes
- [ ] Deployment takes less than 2 minutes

### Code quality
- [ ] 100% of commits pass CI
- [ ] Test coverage >80% overall
- [ ] No manual deployment steps

### Team productivity  
- [ ] New team members can run locally in <10 minutes
- [ ] Clear separation of concerns between components
- [ ] Consistent coding patterns across codebase

## Risk mitigation

### Build complexity
**Risk**: WASM build pipeline becomes complex  
**Mitigation**: Start with minimal configuration, add optimization incrementally

### Test maintenance burden
**Risk**: E2E tests become flaky and hard to maintain  
**Mitigation**: Focus on critical workflows only, robust test isolation

### Development environment drift
**Risk**: Local dev differs from production  
**Mitigation**: Use same Workers runtime locally, consistent configuration

### CI/CD reliability
**Risk**: Deployment pipeline becomes unreliable  
**Mitigation**: Comprehensive testing, rollback mechanisms, gradual rollout

## Dependencies

### External tools required
- Node.js 18+ (frontend + tooling)
- Rust 1.70+ (backend)
- wasm-pack (WASM builds)
- Wrangler CLI (Workers deployment)
- Playwright (E2E testing)

### Cloudflare services
- Workers (API hosting)
- Pages (frontend hosting)  
- KV (flag storage)
- Analytics (monitoring)

### Development dependencies
- Git (version control)
- GitHub Actions (CI/CD)
- NPM registry (frontend dependencies)
- Crates.io (Rust dependencies)

## Completion timeline

**Optimistic**: 1-2 weeks with focused effort  
**Realistic**: 2-3 weeks with other priorities  
**Pessimistic**: 3-4 weeks with blockers/learning curve

Ready to begin with workspace restructure as the first foundation?