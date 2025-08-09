import { test, expect } from '@playwright/test';

test('admin UI loads', async ({ page }) => {
  await page.goto('/admin');
  await expect(page).toHaveTitle(/Cloth/);
});

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
  const response = await page.request.get('/api/flags/e2e-test-flag');
  expect(response.status()).toBe(200);
  
  const flag = await response.json();
  expect(flag.key).toBe('e2e-test-flag');
  expect(flag.enabled).toBe(false); // Default value
});