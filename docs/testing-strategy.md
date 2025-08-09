# Testing strategy

## Overview

Cloth uses a multi-layered testing approach that leverages the monorepo structure for comprehensive validation from unit tests to full end-to-end workflows.

## Testing pyramid

### Unit tests (cloth-core/)
**Purpose**: Test business logic in isolation  
**Framework**: Built-in Rust `#[test]`  
**Coverage**: Flag evaluation, context matching, type validation

```rust
#[test]
fn flag_evaluation_boolean() {
    let flag = Flag::new("test", true, FlagMetadata::default());
    let context = EvaluationContext::empty();
    assert!(flag.evaluate(&context));
}

#[test] 
fn flag_evaluation_with_targeting() {
    let flag = Flag::with_strategy("test", EvaluationStrategy::UserSegment {
        included_users: vec!["user123".to_string()]
    });
    let context = EvaluationContext::new().with_user_id("user123");
    assert!(flag.evaluate(&context));
}
```

### Integration tests (tests/integration/)
**Purpose**: Test API endpoints with Workers runtime  
**Framework**: `wasm-bindgen-test` + `worker-test`  
**Coverage**: HTTP handlers, KV operations, error handling

```rust
#[wasm_bindgen_test]
async fn create_flag_endpoint() {
    let env = TestEnv::new().await;
    let request = TestRequest::post("/api/flags")
        .json(&CreateFlagRequest {
            key: "test-flag".to_string(),
            enabled: true,
            name: "Test Flag".to_string(),
        });
    
    let response = env.dispatch(request).await;
    assert_eq!(response.status(), 201);
    
    // Verify in KV
    let stored = env.kv().get("flags:test-flag").await;
    assert!(stored.is_some());
}
```

### End-to-end tests (tests/e2e/)
**Purpose**: Test complete workflows via browser automation  
**Framework**: Playwright  
**Coverage**: Admin UI flows, API + frontend integration

```typescript
test('flag lifecycle management', async ({ page }) => {
  // Create flag via admin UI
  await page.goto('/admin');
  await page.click('[data-testid=create-flag-button]');
  await page.fill('[name=key]', 'e2e-test-flag');
  await page.fill('[name=name]', 'E2E Test Flag');
  await page.click('[data-testid=save-button]');
  
  // Verify flag appears in list
  await expect(page.locator('[data-testid=flag-row]')).toContainText('e2e-test-flag');
  
  // Verify API has the flag
  const apiResponse = await fetch('/api/flags/e2e-test-flag');
  expect(apiResponse.status).toBe(200);
  
  const flag = await apiResponse.json();
  expect(flag.key).toBe('e2e-test-flag');
  expect(flag.enabled).toBe(false); // Default value
});

test('flag evaluation and updates', async ({ page }) => {
  // Create a flag programmatically
  await fetch('/api/flags', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      key: 'eval-test',
      enabled: false,
      name: 'Evaluation Test'
    })
  });
  
  // Verify evaluation returns false
  const evalResponse = await fetch('/api/flags/eval-test/evaluate');
  const result = await evalResponse.json();
  expect(result.enabled).toBe(false);
  
  // Enable via UI
  await page.goto('/admin');
  await page.click('[data-testid=flag-eval-test] [data-testid=toggle-switch]');
  
  // Verify evaluation now returns true
  const updatedResponse = await fetch('/api/flags/eval-test/evaluate');
  const updatedResult = await updatedResponse.json();
  expect(updatedResult.enabled).toBe(true);
});
```

## Test environment setup

### Local development
- **API**: `wrangler dev` with test KV namespace
- **Frontend**: `npm run dev` pointing to local API
- **Database**: Isolated KV namespace per test run

### Test data management
```typescript
// tests/fixtures/flags.ts
export const testFlags = {
  simpleFlag: {
    key: 'simple-test',
    enabled: true,
    name: 'Simple Test Flag'
  },
  segmentedFlag: {
    key: 'segmented-test', 
    enabled: true,
    name: 'Segmented Flag',
    strategy: {
      type: 'user-segment',
      included_users: ['test-user-1', 'test-user-2']
    }
  }
};

// Test helper for setup/teardown
export class TestEnvironment {
  async setup() {
    await this.clearKV();
    await this.seedFlags(testFlags);
  }
  
  async teardown() {
    await this.clearKV();
  }
}
```

### CI/CD testing
```yaml
# .github/workflows/test.yml
test:
  steps:
    - name: Unit tests
      run: cargo test --workspace
      
    - name: Integration tests  
      run: wasm-pack test --node cloth-api
      
    - name: Build frontend
      run: cd frontend && npm run build
      
    - name: E2E tests
      run: |
        wrangler dev --port 8787 &
        cd frontend && npm run preview --port 3000 &
        npx playwright test
```

## Testing commands

```bash
# All tests
bin/test

# Individual layers
bin/test-unit          # Rust unit tests
bin/test-integration   # API integration tests  
bin/test-e2e          # Browser automation tests

# Test with coverage
bin/test-coverage

# Watch mode for development
bin/test-watch
```

## Coverage targets

- **Unit tests**: >90% for cloth-core business logic
- **Integration tests**: 100% of API endpoints
- **E2E tests**: Critical user workflows only
- **Overall**: >80% combined coverage

## Test isolation

### KV namespace isolation
```rust
// Each test gets unique namespace
let namespace = format!("test-{}", uuid::Uuid::new_v4());
let env = TestEnv::with_kv_namespace(namespace);
```

### Database cleanup
- Automatic cleanup between tests
- Test fixtures reset to known state
- No test data pollution

### Parallel execution
- Tests run in parallel safely
- No shared state between test cases
- Isolated Workers environments

## Performance testing

### Load testing (future)
- API endpoint stress testing
- KV storage performance validation
- Concurrent flag evaluation benchmarks

### Browser performance (future)  
- Frontend bundle size monitoring
- Runtime performance regression tests
- Memory leak detection

## Debugging failing tests

### Local debugging
```bash
# Run single test with logs
RUST_LOG=debug cargo test flag_evaluation -- --nocapture

# Debug integration test
wrangler dev --log-level debug
```

### CI debugging
- Test artifacts saved on failure
- Screenshot capture for E2E failures
- Full request/response logging for integration tests