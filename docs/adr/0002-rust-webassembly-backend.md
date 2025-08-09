# ADR-0002: Rust + WebAssembly for Workers backend

**Status**: Accepted  
**Date**: 2025-08-09  
**Deciders**: Engineering team

## Context

Cloudflare Workers supports both TypeScript and Rust+WASM. Need to choose based on:
- Development velocity vs runtime performance
- Code sharing opportunities
- Team expertise and maintenance burden
- Long-term scalability requirements

## Decision

Use Rust with `worker` crate compiled to WebAssembly for the backend API.

## Rationale

### Performance benefits
- 2-5x faster execution than TypeScript
- Lower memory footprint 
- Better resource utilization = lower Workers costs

### Code sharing opportunities
- Reuse evaluation logic in native SDK clients
- Consistent behavior across all platforms
- Reduced maintenance burden

### Type safety
- Compile-time guarantees reduce runtime errors
- Better suited for complex evaluation algorithms

### Future-proofing
- WASM expanding rapidly on edge platforms
- Investment in growing ecosystem

## Alternatives considered

### TypeScript
- **Pros**: Faster development, rich ecosystem, easier debugging
- **Cons**: Runtime errors, performance limitations, no code sharing
- **Verdict**: Development velocity not worth performance trade-offs

### Hybrid approach (TS first, port to Rust)
- **Pros**: Faster MVP, gradual migration
- **Cons**: Double implementation work, inconsistent behavior
- **Verdict**: Creates more work long-term

## Consequences

### Positive
- Excellent runtime performance and cost efficiency
- Code sharing across SDK implementations
- Compile-time safety for complex evaluation logic

### Negative  
- ~20% slower development iteration
- Larger bundle size (50-100KB vs 10KB)
- Requires Rust expertise on team

### Mitigation strategies
- Use `wee_alloc` and size optimization
- Comprehensive testing to offset debugging complexity
- Start with minimal feature set
- Good documentation for team onboarding