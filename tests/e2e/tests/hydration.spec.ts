import { test, expect } from '@playwright/test';

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
    await page.goto('/');
    
    // Wait for React to render content
    await page.waitForSelector('text=Cloth Feature Flags', { timeout: 10000 });
    
    // Check that main navigation is present
    await expect(page.locator('nav a')).toHaveCount(2);
    await expect(page.locator('text=Flags')).toBeVisible();
    await expect(page.locator('text=Admin')).toBeVisible();
  });

  test('API integration works after hydration', async ({ page }) => {
    await page.goto('/');
    
    // Wait for loading state to disappear
    await page.waitForSelector('text=Loading flags...', { state: 'hidden', timeout: 15000 });
    
    // Should show either flags or empty state
    const hasFlags = await page.locator('[data-testid="flag-row"]').count();
    const hasEmptyState = await page.locator('text=No flags configured yet').isVisible();
    
    expect(hasFlags > 0 || hasEmptyState).toBe(true);
  });

  test('CSS loads and applies correctly', async ({ page }) => {
    await page.goto('/');
    
    // Check that Tailwind CSS is loaded
    const headerElement = page.locator('h1');
    await expect(headerElement).toBeVisible();
    
    // Check that CSS classes are applied (Tailwind CSS working)
    const headerClasses = await headerElement.getAttribute('class');
    expect(headerClasses).toContain('text-3xl');
    expect(headerClasses).toContain('font-bold');
  });

  test('client-side routing works', async ({ page }) => {
    await page.goto('/');
    
    // Click admin link
    await page.click('text=Admin');
    
    // URL should change (client-side routing)
    await expect(page).toHaveURL('/admin');
    
    // Go back to home
    await page.click('text=Flags');
    await expect(page).toHaveURL('/');
  });

  test('handles network failures gracefully', async ({ page }) => {
    // Block API requests to simulate network issues
    await page.route('**/api/flags', route => route.abort());
    
    await page.goto('/');
    
    // Should show error state, not crash
    await page.waitForSelector('text=Failed to load flags', { timeout: 10000 });
    expect(page.locator('text=Failed to load flags')).toBeVisible();
  });
});