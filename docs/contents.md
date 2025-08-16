# Documentation Contents

This directory contains comprehensive documentation for the project architecture and usage patterns.

## Documents

### [Architecture](./architecture.md)
Comprehensive overview of the layered architecture, design decisions, and patterns used throughout the codebase.

**Key topics:**
- Directory structure and dependency flow
- Shared API contracts pattern
- Client layer separation
- Technology choices and rationale

### [Template Usage](./template-usage.md)
Step-by-step guide for adapting this codebase as a template for new projects.

**Key topics:**
- Domain replacement checklist
- Common patterns to preserve
- Customization points
- Project structure after adaptation

### [Development](./development.md)
Practical guide for day-to-day development work on this project.

**Key topics:**
- Setup and development commands
- Development workflow
- Testing strategy
- Common tasks and troubleshooting

### [Multi-tenancy](./multi-tenancy.md)
Design document for implementing multi-tenant isolation using Durable Objects.

**Key topics:**
- Per-organization Durable Object isolation
- Data model changes for tenancy
- Authentication integration
- Implementation roadmap

## Quick Reference

### Development Commands
```bash
./bin/dev      # Start local development
./bin/test     # Run tests
./bin/check    # Type checking
./bin/lint     # Code linting
./bin/format   # Code formatting
./bin/build    # Production build
./bin/deploy   # Deploy to Cloudflare
```

### Architecture Layers
```
Frontend (React + TanStack Query)
    ↓
Service Layer (HTTP API)
    ↓
Core Domain (Business Logic)
    ↑
Storage Layer (Durable Objects)
```

### Key Patterns
- **Shared types** between frontend and backend
- **Pure client functions** separated from React state
- **Domain-driven design** with clean dependencies
- **Template-friendly** consistent patterns