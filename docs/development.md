# Development Guide

## Getting Started

### Prerequisites
- Node.js 20+
- npm

### Setup
```bash
npm install
```

### Development Commands

All development commands are available as scripts in `bin/`:

```bash
# Start local development server
./bin/dev

# Run tests
./bin/test

# Type checking
./bin/check

# Linting
./bin/lint
./bin/lint:fix

# Formatting
./bin/format
./bin/format:check

# Build for production
./bin/build

# Deploy to Cloudflare
./bin/deploy
```

## Architecture Overview

This project uses a layered architecture:

```
Frontend (React + TanStack Query)
    ↓
Service Layer (HTTP API)
    ↓
Core Domain (Business Logic)
    ↑
Storage Layer (Durable Objects)
```

See [architecture.md](./architecture.md) for detailed information.

## Development Workflow

### 1. Running Locally

```bash
./bin/dev
```

This starts the Cloudflare Workers development server with:
- Hot reloading for both worker and frontend code
- Local Durable Objects simulation
- API available at `http://localhost:8787/api/*`
- Frontend available at `http://localhost:8787/`

### 2. Making Changes

**For new features:**
1. Start with domain types in `src/core/`
2. Add business logic to service classes
3. Create API contracts in `src/service/api.ts`
4. Implement route handlers in `src/service/routes/`
5. Add frontend client functions
6. Create React hooks with TanStack Query
7. Update UI components

**For bug fixes:**
1. Write a failing test first
2. Fix the issue in the appropriate layer
3. Ensure tests pass

### 3. Testing

```bash
# Run all tests
./bin/test

# Watch mode during development
npm run test:watch

# Type checking
./bin/check
```

**Test structure:**
- `src/test/worker.test.ts` - API endpoint tests
- `src/test/storage.test.ts` - Storage layer tests  
- `src/frontend/pages/*.test.tsx` - Component tests

### 4. Code Quality

Before committing:

```bash
./bin/format     # Format code
./bin/lint       # Check for issues
./bin/check      # Type checking
./bin/test       # Run tests
```

## Key Technologies

### Backend
- **Cloudflare Workers** - Serverless runtime
- **Hono** - Web framework  
- **Durable Objects** - Stateful storage
- **TypeScript** - Type safety

### Frontend  
- **React** - UI framework
- **TanStack Query** - Data fetching and caching
- **Tailwind CSS** - Styling
- **Vite** - Build tool

### Development
- **Wrangler** - Cloudflare Workers CLI
- **Vitest** - Testing framework
- **ESLint** - Code linting
- **Prettier** - Code formatting

## Common Tasks

### Adding a New API Endpoint

1. **Define types** in `src/service/api.ts`:
```typescript
export interface NewFeatureRequest {
  name: string;
}
export type NewFeatureResponse = ApiSuccessResponse<SomeType>;
```

2. **Create route handler** in `src/service/routes/`:
```typescript
export async function newFeature(c: Context<{ Bindings: Env }>) {
  // Implementation
}
```

3. **Register route** in `src/service/routes/index.ts`:
```typescript
app.post('/api/new-feature', newFeature);
```

4. **Add client function**:
```typescript
export const client = {
  newFeature: (data: NewFeatureRequest) => 
    fetch('/api/new-feature', { method: 'POST', body: JSON.stringify(data) })
};
```

5. **Create React hook**:
```typescript
export function useNewFeature() {
  return useMutation({
    mutationFn: client.newFeature
  });
}
```

### Adding a New Component

1. Create component in `src/frontend/pages/`
2. Use existing hooks for data fetching
3. Follow Tailwind CSS patterns from existing components
4. Add tests in same directory

### Debugging

**Worker logs:**
```bash
./bin/dev
# Logs appear in terminal
```

**Frontend debugging:**
- Open browser dev tools
- React DevTools extension
- TanStack Query DevTools (in development)

**Database inspection:**
- Durable Objects state is ephemeral in local development
- Use `console.log` in storage layer for debugging
- Production state persists in Cloudflare

## Deployment

### Staging/Development
```bash
# Deploy to development environment
npx wrangler deploy --env development
```

### Production
```bash
./bin/deploy
```

This runs the production build and deploys to Cloudflare Workers.

## Troubleshooting

### Common Issues

**"wrangler: command not found"**
- Ensure you're using `npx wrangler` or `./bin/dev`
- Check that wrangler is in package.json devDependencies

**Styles not loading**
- Check Tailwind config content paths match your file structure
- Rebuild with `./bin/build`

**TypeScript errors**
- Run `./bin/check` to see all type errors
- Check imports are using correct paths after refactoring

**Tests failing**
- Ensure all test files import from correct paths
- Check mocks are updated for new API structure

### Getting Help

1. Check this documentation
2. Review architectural decisions in [architecture.md](./architecture.md)
3. Look at existing code patterns
4. Check Cloudflare Workers documentation