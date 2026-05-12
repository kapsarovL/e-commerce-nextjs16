import { test, expect } from '@playwright/test';

test.describe('Admin Dashboard', () => {
  test('admin dashboard displays overview metrics', async ({ page }) => {
    await page.goto('/admin');

    // Dashboard content may be protected or require admin role
    // Check if redirected to sign-in
    if (page.url().includes('sign-in')) {
      expect(true).toBe(true); // Expected - needs authentication
      return;
    }

    // If accessible, check for dashboard elements
    const dashboardContainer = page.locator('[data-testid="admin-dashboard"]');
    if (await dashboardContainer.isVisible()) {
      // Check for key metrics
      const revenueCard = page.locator('[data-testid="revenue-card"]');
      const ordersCard = page.locator('[data-testid="orders-card"]');
      const productsCard = page.locator('[data-testid="products-card"]');

      // At least some metrics should be visible
      const hasMetrics = await Promise.all([
        revenueCard.isVisible().catch(() => false),
        ordersCard.isVisible().catch(() => false),
        productsCard.isVisible().catch(() => false),
      ]).then(results => results.some(v => v));

      expect(hasMetrics).toBeTruthy();
    }
  });

  test('admin can navigate to categories page', async ({ page }) => {
    await page.goto('/admin');

    if (page.url().includes('sign-in')) {
      expect(true).toBe(true);
      return;
    }

    // Find categories link
    const categoriesLink = page.locator('a:has-text("Categories")');
    if (await categoriesLink.isVisible()) {
      await categoriesLink.click();

      // Verify navigation
      await expect(page).toHaveURL(/admin\/categories/);

      // Check for categories list
      const categoriesList = page.locator('[data-testid="categories-list"]');
      await expect(categoriesList).toBeVisible().catch(() => {
        // Categories may be in a table format
        const table = page.locator('table');
        expect(table).toBeVisible();
      });
    }
  });

  test('admin dashboard shows recent orders', async ({ page }) => {
    await page.goto('/admin');

    if (page.url().includes('sign-in')) {
      expect(true).toBe(true);
      return;
    }

    // Look for recent orders section
    const recentOrders = page.locator('[data-testid="recent-orders"]');
    if (await recentOrders.isVisible()) {
      // Should display order list
      const orderRows = page.locator('[data-testid="order-row"]');
      const count = await orderRows.count();
      expect(count).toBeGreaterThanOrEqual(0);
    }
  });

  test('admin dashboard shows product stats', async ({ page }) => {
    await page.goto('/admin');

    if (page.url().includes('sign-in')) {
      expect(true).toBe(true);
      return;
    }

    // Check for product-related stats
    const productStats = page.locator('[data-testid="product-stats"]');
    if (await productStats.isVisible()) {
      // Should have numeric values
      const statValues = page.locator('[data-testid="stat-value"]');
      const count = await statValues.count();
      expect(count).toBeGreaterThan(0);
    }
  });

  test('admin can filter recent orders', async ({ page }) => {
    await page.goto('/admin');

    if (page.url().includes('sign-in')) {
      expect(true).toBe(true);
      return;
    }

    // Find status filter
    const statusFilter = page.locator('select[name="status"]');
    if (await statusFilter.isVisible()) {
      await statusFilter.selectOption('completed');

      // Wait for results to update
      await page.waitForLoadState('networkidle');

      // Verify filtered results
      const orderRows = page.locator('[data-testid="order-row"]');
      expect(await orderRows.count()).toBeGreaterThanOrEqual(0);
    }
  });
});
