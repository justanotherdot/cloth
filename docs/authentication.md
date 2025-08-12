# Authentication architecture

## Overview

Cloth uses a dual authentication strategy to serve both interactive admin users and programmatic SDK clients:

1. **JWT-based authentication** for admin interface (via Cloudflare Access)
2. **API keys** for SDK clients (future implementation)

## Cloudflare Access integration

### Application type: Self-hosted

Even though Cloth runs on Cloudflare Workers, we use the "Self-hosted" application type because:

- **SaaS applications:** Pre-configured integrations with third-party services (Jira, Slack) where CF Access acts as identity provider
- **Self-hosted applications:** Custom applications where you implement JWT validation yourself

### Authentication flow

```
Admin UI → CF Access → JWT → Rust Workers → KV Storage
```

1. User accesses admin interface
2. Cloudflare Access handles authentication (login, MFA, etc.)
3. CF Access issues JWT token
4. Frontend includes JWT in requests to Workers API
5. Workers validate JWT signature, issuer, and audience
6. Authorized requests proceed to business logic

### JWT validation

Workers receive these headers from CF Access:
```
Cf-Access-Jwt-Assertion: <jwt-token>
Cf-Access-Authenticated-User-Email: user@domain.com
```

JWT claims structure:
```json
{
  "iss": "https://your-team.cloudflareaccess.com",
  "aud": ["your-aud-tag"],
  "email": "user@domain.com", 
  "sub": "user-id",
  "exp": 1234567890
}
```

### Path-based protection

Recommended configuration:
- `/api/flags/:key/evaluate` - Public (no authentication)
- `/api/flags/*` - Protected by CF Access

This allows SDK clients to evaluate flags without authentication while protecting admin operations.

## Federated identity concepts

### What is federated identity?

"Federated" comes from political science - independent entities agreeing to work together under shared rules, like states in a federation.

In identity systems:
- **Multiple domains of control:** Different organizations maintain their own services
- **Autonomous systems:** Each system remains independent
- **Agreed standards:** Systems federate through protocols like SAML/OIDC
- **Trust relationships:** Like treaties between independent nations

### CF Access as identity provider

In SaaS mode, CF Access acts as a federated identity provider:

```
User → Third-party SaaS → CF Access (authentication) → 
SAML assertion → SaaS app (trusts assertion) → Access granted
```

**Benefits:**
- Single sign-on across multiple services
- Centralized user management
- Consistent access policies
- Audit trail across federated services

### Standards used

- **SAML 2.0:** Enterprise standard for federated authentication
- **OIDC/OAuth2:** Modern web standard for identity federation
- **JWT:** Token format for carrying identity claims

## Future: API key authentication

For SDK clients, we will implement:

1. **Client credentials flow:** SDKs authenticate with client ID/secret
2. **Short-lived tokens:** Automatic token refresh (1-hour expiration)
3. **Scoped permissions:** Read-only access to flag evaluation
4. **Revocation capability:** Instant client credential revocation

This provides programmatic access without the complexity of browser-based authentication flows.