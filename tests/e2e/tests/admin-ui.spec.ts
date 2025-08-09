import { test, expect } from '@playwright/test';

// Helper function to set up authentication
async function authenticate(page: any) {
  await page.goto('/');
  // Check if auth form is present
  const authForm = await page.locator('form').isVisible();
  if (authForm) {
    await page.fill('input[name="password"]', 'dev123');
    await page.click('button[type="submit"]');
    await page.waitForLoadState('networkidle');
  }
}

test('admin UI loads', async ({ page }) => {
  await authenticate(page);
  await page.goto('/admin');
  await expect(page).toHaveTitle(/Cloth/);
});

test('basic navigation works', async ({ page }) => {
  await authenticate(page);
  
  // Check main flags page works
  await expect(page.locator('h1')).toContainText('Cloth Feature Flags');
  
  // Navigate to admin (even if it shows same content)
  await page.click('nav a[href="/admin"]');
  await expect(page).toHaveURL('/admin');
  
  // Navigate back to flags
  await page.click('nav a[href="/"]');
  await expect(page).toHaveURL('/');
});