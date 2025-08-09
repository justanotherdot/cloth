# Technology radar

## Adopt

Technologies we're confident in and actively using.

### Languages & runtimes
- **Rust**: Core evaluation logic, Workers backend, native SDKs
- **TypeScript**: Frontend, initial SDK implementation  
- **WebAssembly**: Browser and edge deployment target

### Infrastructure
- **Cloudflare Workers**: API hosting with global distribution
- **Cloudflare Pages**: Static frontend hosting and deployment
- **Cloudflare KV**: Persistent flag storage with global replication

### Development tools
- **Wrangler**: Deployment and local development
- **wee_alloc**: WASM memory optimization
- **worker crate**: Rust Workers runtime bindings

## Trial  

Technologies we're experimenting with on low-risk projects.

### Client architecture
- **WASM in browsers**: For shared evaluation logic
- **React + Vite**: Minimal frontend stack
- **WebSocket/SSE**: Real-time critical flag updates

### Testing & monitoring
- **wasm-pack-test**: WASM unit testing
- **Playwright**: End-to-end testing
- **Workers Analytics**: Usage monitoring

## Assess

Technologies worth investigating but not yet proven for our use case.

### Advanced features  
- **CRDTs**: Conflict-free flag synchronization
- **IndexedDB**: Client-side flag persistence
- **Service Workers**: Offline flag evaluation

### Language bindings
- **napi-rs**: Node.js native bindings
- **PyO3**: Python bindings for Rust core
- **cgo**: Go bindings for Rust core

### Infrastructure alternatives
- **Durable Objects**: Stateful coordination (overkill for flags)
- **R2**: Large payload storage (not needed yet)

## Hold

Technologies we're avoiding or moving away from.

### Backend alternatives
- **Node.js Workers**: Performance and code sharing limitations
- **Traditional servers**: Against serverless-first strategy
- **External databases**: Prefer Cloudflare-native storage

### Client patterns
- **Always-online evaluation**: Conflicts with local-first approach
- **Polling-only sync**: Inefficient for critical flag updates
- **Single-language SDKs**: Maintenance burden too high

## Decision timeline

- **Q4 2024**: Rust + WASM backend (Adopt)
- **Q1 2025**: TypeScript SDK with WASM core (Trial → Adopt)
- **Q2 2025**: WebSocket real-time updates (Assess → Trial)
- **Q3 2025**: Native Rust SDK (Assess → Trial)
- **Q4 2025**: Additional language bindings (Assess)