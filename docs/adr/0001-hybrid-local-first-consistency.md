# ADR-0001: Hybrid local-first consistency model

**Status**: Accepted  
**Date**: 2025-08-09  
**Deciders**: Engineering team

## Context

Feature flags require balancing performance (low latency) with consistency (real-time updates). Two main approaches exist:

1. **Consistency-first**: Every flag evaluation hits the server
2. **Local-first**: Flags cached locally, eventual consistency

Pure consistency-first creates latency/reliability issues. Pure local-first risks stale critical flags (kill switches, security features).

## Decision

Implement hybrid local-first approach with smart consistency boundaries:

### Flag criticality levels
- `critical`: Always server-side evaluation (kill switches, security)
- `stable`: Local-first with 1hr TTL (UI features, experiments) 
- `experimental`: Local-first with 5min TTL (new features)

### Synchronization strategy
- Bootstrap bundle on app start (all flags)
- Background periodic sync for stable flags
- Real-time WebSocket updates for critical flags only
- Graceful degradation with fallback defaults

### Consistency guarantees  
- Session-level consistency for A/B tests
- User-level consistency for personalization
- Global consistency for kill switches

## Consequences

### Positive
- 95%+ flag evaluations happen locally (zero latency)
- Apps work offline and survive service outages
- 90%+ reduction in API calls at scale
- Mobile-friendly (minimal battery impact)

### Negative
- SDK complexity increases significantly
- Risk of stale data for non-critical flags
- Need clear flag criticality guidelines

### Neutral
- Requires comprehensive testing strategy
- Need monitoring for consistency violations