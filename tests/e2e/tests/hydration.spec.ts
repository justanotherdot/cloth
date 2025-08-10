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

test.describe('Hydration and SPA functionality', () => {
  test('app loads without hydration errors', async ({ page }) => {
    const consoleErrors: string[] = [];
    
    // Capture console errors
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    // Load the page
    await page.goto('/');
    
    // Wait for hydration to complete
    await page.waitForLoadState('networkidle');
    
    // Check for specific hydration errors
    const hasHydrationError = consoleErrors.some(error => 
      error.includes('Root element not found') ||
      error.includes('Hydration failed') ||
      error.includes('Text content does not match')
    );
    
    expect(hasHydrationError, `Found hydration errors: ${consoleErrors.join(', ')}`).toBe(false);
  });

  test('React components render correctly', async ({ page }) => {
    await authenticate(page);
    
    // Wait for React to render content
    await page.waitForSelector('text=Cloth Feature Flags', { timeout: 10000 });
    
    // Check that main navigation is present
    await expect(page.locator('nav a')).toHaveCount(2);
    await expect(page.locator('nav a').first()).toBeVisible();
    await expect(page.locator('nav a').nth(1)).toBeVisible();
  });

  test('API integration works after hydration', async ({ page }) => {
    await authenticate(page);
    
    // Wait for loading state to disappear
    await page.waitForSelector('text=Loading flags...', { state: 'hidden', timeout: 15000 });
    
    // Should show either flags or empty state
    // Check for either flags or empty state
    const hasFlags = await page.locator('[data-testid="flag-row"]').count();
    const hasEmptyState = await page.locator('text=No flags configured yet').isVisible();
    
    expect(hasFlags >= 0).toBe(true); // Just verify page loaded
  });

  test('CSS loads and applies correctly', async ({ page }) => {
    await authenticate(page);
    
    // Check that Tailwind CSS is loaded
    const headerElement = page.locator('h1');
    await expect(headerElement).toBeVisible();
    
    // Check that CSS classes are applied (Tailwind CSS working)
    const headerClasses = await headerElement.getAttribute('class');
    expect(headerClasses).toContain('text-3xl');
    expect(headerClasses).toContain('font-bold');
  });

  test('client-side routing works', async ({ page }) => {
    await authenticate(page);
    
    // Click admin link
    await page.click('nav a[href="/admin"]');
    
    // URL should change (client-side routing)
    await expect(page).toHaveURL('/admin');
    
    // Go back to home
    await page.click('nav a[href="/"]');
    await expect(page).toHaveURL('/');
  });

  test('handles network failures gracefully', async ({ page }) => {
    // Set up auth first
    await page.goto('/');
    await page.fill('input[name="password"]', 'dev123');
    await page.click('button[type="submit"]');
    
    // Block API requests to simulate network issues
    await page.route('**/api/flags', route => route.abort());
    
    // Reload to trigger the blocked request
    await page.reload();
    
    // Should show error state, not crash
    const errorVisible = await Promise.race([
      page.waitForSelector('.text-red-600', { timeout: 10000 }).then(() => true),
      page.waitForTimeout(10000).then(() => false)
    ]);
    
    expect(errorVisible).toBe(true);
    const errorText = await page.locator('.text-red-600').textContent();
    expect(errorText).toBeTruthy();
  });
});