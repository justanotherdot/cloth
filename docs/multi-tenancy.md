# Multi-tenancy design

## Overview

Multi-tenant isolation using Cloudflare Durable Objects per organization. Each org gets a separate DO instance with complete data and compute isolation.

## Architecture

### Durable object isolation

```typescript
// Each org gets its own DO instance
const orgId = await extractOrgId(request);
const storageId = env.STORAGE.idFromName(orgId);  // Deterministic routing
const storage = env.STORAGE.get(storageId);       // Creates if needed
```

### Data model changes

Add org ID to all entities:

```typescript
interface Flag {
  id: string;
  orgId: string;  // Required for all flags
  key: string;
  name: string;
  description?: string;
  enabled: boolean;
  createdAt: string;
  updatedAt: string;
}
```

### Auth integration

Extract org ID from JWT claims:

```typescript
interface TokenPayload {
  sub: string;
  org_id: string;  // Org identifier from auth provider
  email: string;
}

async function extractOrgId(request: Request): Promise<string> {
  const token = extractBearerToken(request);
  const payload = await validateJWT(token);
  return payload.org_id;
}
```

## Implementation steps

1. Update data types to include `orgId`
2. Modify auth to extract org from token
3. Route requests to org-specific DO instances
4. Update storage operations to validate org ownership
5. Update UI to show org context

## Benefits

- **Complete isolation**: Separate storage, memory, and compute per org
- **Automatic scaling**: New orgs get DO instances on first access
- **Zero cross-tenant leakage**: Impossible to access other org data
- **Geographic distribution**: DOs can run closer to org users

## Considerations

- DO instance limits (1000 concurrent instances per account)
- Cold start latency for inactive orgs
- Billing complexity (usage tracking per org)