# ADR-0004: GitHub Actions for CI/CD pipeline

**Status**: Accepted  
**Date**: 2025-08-09  
**Deciders**: Ryan James Spencer  

## Context

Cloth needs a reliable CI/CD pipeline to:
- Validate builds across Rust workspace and frontend
- Run comprehensive test suite (unit + integration + E2E)
- Deploy to Cloudflare Workers and Pages automatically
- Support team collaboration with consistent quality checks

Options considered:
- GitHub Actions
- GitLab CI
- Cloudflare's CI (limited)
- Circle CI

## Decision

Use GitHub Actions for all CI/CD operations.

## Consequences

### Positive
- Native integration with GitHub repository
- Excellent Rust and Node.js ecosystem support
- Free tier covers expected usage
- Cloudflare CLI (`wrangler`) works seamlessly
- Matrix builds for testing across environments
- Rich action marketplace for common tasks

### Negative
- Vendor lock-in to GitHub platform
- Learning curve for complex workflows
- Potential cold start delays for runners

### Neutral
- Standard YAML configuration format
- Familiar to most developers
- Adequate performance for project scale

## Implementation

Pipeline stages:
1. **Build validation** - Rust workspace + frontend builds
2. **Testing** - Unit, integration, and E2E test execution  
3. **Deployment** - Automated deployment to Workers/Pages
4. **Notifications** - Status reporting and alerts

Configuration stored in `.github/workflows/` following standard conventions.