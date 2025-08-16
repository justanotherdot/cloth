# Architecture Overview

This project demonstrates a clean layered architecture for Cloudflare Workers with React frontend.

## Template-Friendly Design

This codebase is designed to be copied and adapted for multiple similar projects. The patterns here prioritize:
- **Explicit over implicit** - Clear contracts rather than magic
- **Consistency** - Same patterns work across different domains  
- **Evolvability** - Can grow into external SDKs and versioning

## Directory Structure

```
src/
├── core/              # Pure business logic (zero dependencies)
├── service/           # HTTP API layer
│   ├── api.ts        # Shared API contracts  
│   ├── routes/       # Individual route handlers
│   └── http-error.ts # HTTP boundary error mapping
├── frontend/          # React application
│   ├── client/       # Pure API client functions
│   ├── hooks/        # TanStack Query React hooks
│   └── pages/        # React components
├── storage/           # Infrastructure layer (Durable Objects)
└── worker.ts          # Entry point
```

## Dependency Flow

```
Frontend → Service → Core ← Storage
```

**Rules:**
- Core has ZERO external dependencies
- Service imports from Core
- Frontend imports from Core and Service (API contracts)
- Storage implements Core interfaces
- Core NEVER imports from Service/Frontend/Storage

## Key Patterns

### 1. Shared API Contracts

Instead of code generation (tRPC, OpenAPI), we use explicit shared types:

```typescript
// src/service/api.ts - Shared between backend and frontend
export interface FlagCreateRequest {
  key: string;
  name: string;
  // ...
}
```

**Benefits:**
- Clear contracts that can evolve into SDK versioning
- Single deployment unit = types and API deploy together
- Template-friendly across different domains

### 2. Client Layer Separation

```typescript
// src/frontend/client/ - Pure functions, no React
export const flagClient = {
  list: () => fetch('/api/flag').then(r => r.json()),
  // ...
}

// src/frontend/hooks/ - TanStack Query hooks
export function useFlags() {
  return useQuery({
    queryKey: ['flags'],
    queryFn: flagClient.list
  });
}
```

**Benefits:**
- Framework agnostic client (reusable outside React)
- Clean separation of API calls vs state management
- Testable without React

### 3. Error Handling

Domain errors are mapped to HTTP errors at the service boundary:

```typescript
// Core domain error
throw new FlagNotFoundError(id);

// Service layer maps to HTTP
const httpError = HttpError.from(error);
return c.json(httpError.error, httpError.status);
```

## Template Usage

To adapt this for a new domain:

1. **Replace Core types**: `Flag` → `User`, `Order`, etc.
2. **Copy patterns**: Same client/hooks structure
3. **Update API contracts**: Keep the response patterns
4. **Adapt storage**: Same Durable Object patterns

## Technology Choices

- **TanStack Query** over manual useState (separates concerns)
- **Explicit types** over tRPC (template-friendly)
- **Individual route files** over monolithic handlers
- **Layered architecture** over mixed concerns

## Future Evolution

This architecture supports:
- **External SDKs** - Client layer becomes SDK foundation
- **API versioning** - Shared contracts evolve with headers
- **Multiple projects** - Copy/adapt patterns consistently