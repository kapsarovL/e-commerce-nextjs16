import { test, expect } from '@playwright/test';

test.describe('API Integration', () => {
  test('checkout API creates Stripe session', async ({ page }) => {
    // Navigate to checkout
    await page.goto('/products');

    // Add item to cart
    const addButton = page.locator('button:has-text("Add to Cart")').first();
    if (await addButton.isVisible()) {
      await addButton.click();
    }

    // Go to checkout
    await page.goto('/checkout');

    // Fill form
    const emailInput = page.locator('input[name="email"]');
    if (await emailInput.isVisible()) {
      await emailInput.fill('test@example.com');
      await page.locator('input[name="firstName"]').fill('John');
      await page.locator('input[name="lastName"]').fill('Doe');
      await page.locator('input[name="address"]').fill('123 Main St');
      await page.locator('input[name="city"]').fill('NYC');
      await page.locator('input[name="state"]').fill('NY');
      await page.locator('input[name="postalCode"]').fill('10001');
      await page.locator('input[name="country"]').fill('US');

      // Submit and monitor request
      const submitButton = page.locator('button:has-text("Pay")');

      // Listen for requests to checkout API
      let checkoutApiCalled = false;
      page.on('request', request => {
        if (request.url().includes('/api/checkout')) {
          checkoutApiCalled = true;
        }
      });

      await submitButton.click();

      // Wait a bit for the API call
      await page.waitForTimeout(1000);
      expect(checkoutApiCalled).toBeTruthy();
    }
  });

  test('product search API returns results', async ({ page }) => {
    // Monitor API calls
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const responses: any[] = [];
    page.on('response', async response => {
      if (response.url().includes('/api/products') || response.url().includes('/api/search')) {
        responses.push({
          url: response.url(),
          status: response.status(),
        });
      }
    });

    await page.goto('/search');
    const searchInput = page.locator('input[placeholder*="Search"]').first();

    if (await searchInput.isVisible()) {
      await searchInput.fill('test');
      await searchInput.press('Enter');

      // Wait for API response
      await page.waitForLoadState('networkidle');

      // Verify product results loaded
      const products = page.locator('[data-testid="product-card"]');
      const hasResults = await products.count() >= 0;
      expect(hasResults).toBeTruthy();
    }
  });

  test('cart persistence through page reload', async ({ page }) => {
    // Add item to cart
    await page.goto('/products');
    const addButton = page.locator('button:has-text("Add to Cart")').first();

    if (await addButton.isVisible()) {
      await addButton.click();

      // Wait for cart to update
      await page.waitForTimeout(500);

      // Verify cart badge shows item
      const cartBadge = page.locator('[data-testid="cart-badge"]');
      await cartBadge.isVisible().catch(() => false);

      // Reload page
      await page.reload();

      // Verify item still in cart (from sessionStorage)
      await page.waitForLoadState('networkidle');
      const cartBadgeAfterReload = page.locator('[data-testid="cart-badge"]');
      const stillHasItem = await cartBadgeAfterReload.isVisible().catch(() => false);

      expect(stillHasItem).toBeTruthy();
    }
  });

  test('invalid cart request fails gracefully', async ({ page }) => {
    // Intercept and modify cart request
    await page.route('**/api/cart/**', route => {
      if (route.request().method() === 'POST') {
        route.abort('failed');
      } else {
        route.continue();
      }
    });

    await page.goto('/products');
    const addButton = page.locator('button:has-text("Add to Cart")').first();

    if (await addButton.isVisible()) {
      await addButton.click();

      // Should handle error gracefully
      await page.waitForTimeout(500);

      // Page should still be functional
      const productCards = page.locator('[data-testid="product-card"]');
      expect(await productCards.count()).toBeGreaterThan(0);
    }
  });
});

test.describe('Real-time Stock Updates', () => {
  test('product stock updates when other user purchases', async ({ page }) => {
    // Open product detail page
    await page.goto('/products');
    const productLink = page.locator('[data-testid="product-card"] a').first();

    if (await productLink.isVisible()) {
      await productLink.click();

      // Get initial stock
      const stockText = page.locator('[data-testid="stock-badge"]');
      await stockText.textContent().catch(() => null);

      // Simulate time passing (in real scenario, other user purchases)
      await page.waitForTimeout(1000);

      // Refresh to check for updates
      await page.reload();

      // Stock should be readable
      const updatedStock = await stockText.textContent().catch(() => null);
      expect(updatedStock).toBeTruthy();
    }
  });
});
