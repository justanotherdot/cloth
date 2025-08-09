# Architecture

## Overview

Cloth is a minimal feature flag service designed for extensibility. The system consists of four main components:

- **API**: Rust-based Workers service handling flag evaluation and management
- **Frontend**: React-based admin interface for flag configuration  
- **SDK**: Client libraries for consuming feature flags
- **Documentation**: Comprehensive guides and API reference

## Components

### API (Cloudflare Workers)

**Technology**: Rust with `worker` crate
**Storage**: Cloudflare KV
**Deployment**: Wrangler

The API provides RESTful endpoints for flag evaluation and management. It's designed to be stateless and globally distributed.

#### Core types

```rust
pub struct Flag {
    pub key: String,
    pub enabled: bool,
    pub metadata: FlagMetadata,
}

pub struct FlagMetadata {
    pub name: String,
    pub description: Option<String>,
    pub created_at: i64,
    pub updated_at: i64,
    pub strategy: EvaluationStrategy,
}

pub enum EvaluationStrategy {
    Boolean,
    // Future: Percentage, UserSegment, Experiment, etc.
}

pub struct EvaluationContext {
    pub user_id: Option<String>,
    pub session_id: Option<String>,
    pub attributes: HashMap<String, String>,
}
```

#### API endpoints

```
GET  /api/flags/:key/evaluate?context={}  # Evaluate flag for context
GET  /api/flags                           # List all flags  
GET  /api/flags/:key                      # Get flag details
POST /api/flags                           # Create flag
PUT  /api/flags/:key                      # Update flag
DELETE /api/flags/:key                    # Delete flag
POST /api/flags/bulk-evaluate             # Bulk evaluate multiple flags
```

### Frontend (Cloudflare Pages)

**Technology**: React with Vite
**Styling**: Minimal CSS (no framework)
**Deployment**: Wrangler Pages

Simple admin interface for managing flags. Connects to API via fetch calls.

#### Key features
- Flag list with search/filter
- Flag creation and editing
- Real-time flag status
- Basic analytics (future)

### SDK (Client Libraries)

Multi-language SDK for consuming feature flags with caching, fallbacks, and analytics.

#### Supported languages (roadmap)
- **JavaScript/TypeScript** (browser + Node.js)
- **Rust** (native applications)  
- **Python** (web services)
- **Go** (microservices)

#### SDK features
- **Evaluation**: `client.isEnabled("feature-key", context)`
- **Caching**: Local cache with TTL and background refresh
- **Fallbacks**: Default values when service unavailable
- **Analytics**: Usage tracking and A/B test attribution
- **Streaming**: Real-time flag updates (future)

#### JavaScript SDK example

```typescript
import { ClothClient } from '@cloth/client'

const client = new ClothClient({
  apiUrl: 'https://flags-api.your-domain.workers.dev',
  apiKey: process.env.CLOTH_API_KEY,
  defaultContext: { environment: 'production' }
})

// Simple evaluation
const isEnabled = await client.isEnabled('new-checkout-flow')

// With context  
const showPremium = await client.isEnabled('premium-features', {
  userId: '123',
  plan: 'pro'
})

// Bulk evaluation for performance
const flags = await client.evaluateAll(['feature-a', 'feature-b'], context)
```

### Storage layer

Cloudflare KV stores flags as JSON with the following structure:

```
flags:{key} -> Flag JSON
flags:list  -> Array of flag keys (for efficient listing)
meta:stats  -> Usage statistics (future)
```

## Data flow

1. **Flag evaluation**: 
   - SDK → Local cache (hit) → Return value
   - SDK → Workers API → KV → Cache + Return value
2. **Flag management**: Admin UI → Workers → KV → Response
3. **Flag updates**: Workers → KV → Global propagation → SDK cache invalidation

## Integration patterns

### Server-side evaluation
```typescript
// Express middleware
app.use(clothMiddleware({
  flags: ['new-ui', 'analytics-v2'],
  context: (req) => ({ userId: req.user?.id })
}))
```

### Client-side evaluation  
```typescript
// React hook
function MyComponent() {
  const showNewUI = useFlag('new-ui', { userId })
  return showNewUI ? <NewUI /> : <OldUI />
}
```

### Edge evaluation
```typescript
// Next.js middleware
export function middleware(request) {
  const context = { geo: request.geo?.country }
  const showLocalizedUI = await cloth.isEnabled('localized-ui', context)
  return showLocalizedUI ? rewrite('/localized') : next()
}
```

## Deployment

Single atomic deployment via `bin/deploy`:
1. Build and test API
2. Build and test frontend  
3. Build and test SDK packages
4. Deploy API to Workers
5. Deploy frontend to Pages
6. Publish SDK to npm/crates.io
7. Run smoke tests

## Security

- API keys for admin operations and SDK access
- CORS configuration for browser access  
- Rate limiting via Workers (future)
- SDK request signing for integrity (future)