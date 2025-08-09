# Architecture Decision Records

This directory contains Architecture Decision Records (ADRs) for Cloth. ADRs document significant architectural and technical decisions made during development.

## Format

Each ADR follows this structure:
- **Status**: Proposed, Accepted, Superseded, Deprecated
- **Date**: When the decision was made
- **Deciders**: Who was involved in the decision
- **Context**: The situation requiring a decision
- **Decision**: What we decided to do
- **Consequences**: Positive, negative, and neutral outcomes

## Current ADRs

- [ADR-0001: Hybrid local-first consistency model](0001-hybrid-local-first-consistency.md)
- [ADR-0002: Rust + WebAssembly for Workers backend](0002-rust-webassembly-backend.md) 
- [ADR-0003: Multi-language SDK with shared evaluation core](0003-multi-language-sdk-strategy.md)
<<<<<<< HEAD
=======
- [ADR-0004: GitHub Actions for CI/CD pipeline](0004-github-actions-ci.md)
>>>>>>> 801dfc3 (Document all the things)

## Creating new ADRs

Use the next available number and follow the existing format. Consider creating an ADR when:

- Making significant architectural choices
- Choosing between competing technologies
- Establishing patterns for the codebase
- Making decisions that affect multiple components
- Decisions likely to be questioned later

Keep ADRs concise but comprehensive enough for future team members to understand the reasoning.