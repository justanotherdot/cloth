# Template Usage Guide

This project serves as a template for Cloudflare Workers with React frontends. Here's how to adapt it for your domain.

## Quick Start

1. **Clone the template structure**
2. **Replace the domain** (Flag → YourDomain) 
3. **Update API contracts**
4. **Test and deploy**

## Domain Replacement Checklist

### 1. Core Domain (`src/core/`)

Replace Flag with your business entity:

```typescript
// Before: src/core/flag.ts
export interface Flag {
  id: string;
  key: string;
  // ...
}

// After: src/core/user.ts  
export interface User {
  id: string;
  email: string;
  // ...
}
```

**Files to update:**
- `src/core/flag.ts` → `src/core/your-domain.ts`
- `src/core/flag-service.ts` → `src/core/your-domain-service.ts`
- Update error messages in `src/core/error.ts`

### 2. API Contracts (`src/service/api.ts`)

Update all the API types:

```typescript
// Replace all Flag* types with YourDomain* types
export interface UserCreateRequest {
  email: string;
  name: string;
  // ...
}
```

### 3. Service Routes (`src/service/routes/`)

- Rename `flag.ts` to your domain
- Update route handlers to use your domain service
- Keep the same error handling patterns

### 4. Frontend Client (`src/frontend/client/`)

- Rename `flag-client.ts` to your domain
- Update function names and types
- Keep the same pure function patterns

### 5. Frontend Hooks (`src/frontend/hooks/`)

- Rename `use-flags.ts` to your domain  
- Update query keys and hook names
- Keep the same TanStack Query patterns

### 6. Storage Layer (`src/storage/`)

- Update storage prefixes (`flag:` → `user:`)
- Update interface implementations
- Keep the same Durable Object patterns

### 7. Tests

- Update all test files with new domain
- Keep the same testing patterns
- Update mock data to match your domain

## Common Patterns to Preserve

### Query Keys Pattern
```typescript
export const userKeys = {
  all: ['users'] as const,
  lists: () => [...userKeys.all, 'list'] as const,
  list: (filters: Record<string, unknown> = {}) => [...userKeys.lists(), filters] as const,
};
```

### API Response Pattern
```typescript
export interface UserCreateSuccessResponse extends ApiSuccessResponse<User> {}
export interface UserCreateErrorResponse extends ApiErrorResponse {
  error: {
    code: ErrorCode.UserExists | ErrorCode.ValidationFailed;
    message: string;
  };
}
```

### Client Function Pattern
```typescript
export const userClient = {
  list: (): Promise<UserListResponse> => 
    fetch('/api/user').then(r => r.json()),
  // ...
}
```

## Customization Points

### Different Storage Backends

The storage interface can be implemented with other Cloudflare services:

```typescript
// D1 Database implementation
export class D1UserStorage implements UserStorage {
  constructor(private db: D1Database) {}
  // ...
}

// KV implementation  
export class KVUserStorage implements UserStorage {
  constructor(private kv: KVNamespace) {}
  // ...
}
```

### Different Frontend Frameworks

The client layer is framework agnostic:

```typescript
// Vue composition API
export function useUsers() {
  return useQuery(['users'], userClient.list);
}

// Svelte stores
export const users = writable([]);
userClient.list().then(data => users.set(data));
```

### API Versioning

For future API versions, extend the pattern:

```typescript
// v2 API contracts
export namespace UserApiV2 {
  export interface CreateRequest extends UserApiV1.CreateRequest {
    newField: string;
  }
}

// Header-based versioning
const version = request.headers.get('API-Version') || 'v1';
```

## Project Structure After Adaptation

```
src/
├── core/
│   ├── user.ts           # Your domain type
│   ├── user-service.ts   # Business logic
│   └── error.ts          # Domain errors
├── service/
│   ├── api.ts           # User API contracts
│   └── routes/
│       └── user.ts      # User route handlers
├── frontend/
│   ├── client/
│   │   └── user-client.ts
│   └── hooks/
│       └── use-users.ts
└── storage/
    └── durable-object.ts # UserStorage implementation
```