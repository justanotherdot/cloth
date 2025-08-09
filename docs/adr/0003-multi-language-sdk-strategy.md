# ADR-0003: Multi-language SDK with shared evaluation core

**Status**: Accepted  
**Date**: 2025-08-09  
**Deciders**: Engineering team

## Context

Need client libraries across multiple platforms and languages while maintaining:
- Consistent evaluation behavior
- Performance requirements
- Reasonable maintenance burden

## Decision

Implement multi-language SDK strategy with shared Rust evaluation core:

### Phase 1: TypeScript SDK (browser + Node.js)
- WASM-based evaluation core
- Local caching and background sync
- React hooks and framework integrations

### Phase 2: Native Rust SDK  
- Mobile and desktop applications
- Shared evaluation logic with backend
- High-performance offline support

### Phase 3: Additional language bindings
- Python, Go, Java SDKs as needed
- FFI bindings to shared Rust core
- Language-specific idioms and integrations

## Architecture

```
cloth-core (Rust)           # Evaluation algorithms, shared types
├── cloth-wasm              # WASM bindings for web platforms  
├── cloth-sdk-js            # TypeScript wrapper + web APIs
├── cloth-sdk-rust          # Native Rust SDK + mobile APIs
└── cloth-sdk-*             # Other language FFI bindings
```

## Rationale

### Consistency benefits
- Identical evaluation behavior across all platforms
- Single source of truth for complex algorithms
- Reduced QA burden for multi-platform features

### Performance benefits  
- Native performance on all platforms
- Optimal memory usage patterns
- Minimal overhead from language bindings

### Maintenance benefits
- Core logic implemented once in Rust
- Language bindings focus on platform integration
- Shared test suite for evaluation correctness

## Alternatives considered

### Pure language-native SDKs
- **Pros**: Idiomatic APIs, no FFI complexity
- **Cons**: Logic duplication, inconsistent behavior, high maintenance
- **Verdict**: Consistency more important than API idioms

### Single TypeScript SDK with server evaluation
- **Pros**: Simple implementation, no WASM complexity
- **Cons**: Network dependency, latency, cost at scale
- **Verdict**: Conflicts with local-first strategy

## Consequences

### Positive
- Consistent evaluation across all client platforms
- High performance on mobile and desktop
- Reduced long-term maintenance burden

### Negative
- Complex build pipeline for multiple targets
- WASM/FFI debugging challenges
- Initial implementation overhead

### Neutral
- Need good documentation for SDK integration
- Language-specific packaging and distribution