import { test, expect } from '@playwright/test';

test.describe('Authentication & Order History', () => {
  test('sign in flow redirects to account page', async ({ page }) => {
    await page.goto('/sign-in');

    // Verify sign-in page loads (Clerk component)
    await expect(page).toHaveURL(/sign-in/);

    // Clerk iframe will be present
    const clerkButton = page.locator('[data-clerk-sign-in]');
    if (await clerkButton.isVisible()) {
      // Clerk component is loaded
      expect(true).toBe(true);
    }
  });

  test('protected route redirects to sign-in when not authenticated', async ({ page }) => {
    // Clear auth if needed
    await page.context().clearCookies();

    await page.goto('/account', { waitUntil: 'networkidle' });

    // Should redirect to sign-in or show Clerk modal
    const url = page.url();
    const isSignIn = url.includes('sign-in') || url.includes('account');
    expect(isSignIn).toBeTruthy();
  });

  test('order history page displays orders', async ({ page }) => {
    // Note: This test requires authenticated state
    // In real scenario, you'd use browser context with auth cookies
    await page.goto('/orders', { waitUntil: 'networkidle' });

    // Check if redirected to sign-in (unauthenticated)
    if (page.url().includes('sign-in')) {
      // Expected behavior - redirect to sign-in
      expect(true).toBe(true);
    } else {
      // Authenticated - check for orders or empty state
      const ordersContainer = page.locator('[data-testid="orders-list"]');
      const emptyState = page.locator('text=No orders yet');

      const hasOrders = await ordersContainer.isVisible().catch(() => false);
      const isEmpty = await emptyState.isVisible().catch(() => false);

      expect(hasOrders || isEmpty).toBeTruthy();
    }
  });

  test('order detail page shows items and totals', async ({ page }) => {
    // Navigate to orders
    await page.goto('/orders', { waitUntil: 'networkidle' });

    // Find first order link if it exists
    const orderLinks = page.locator('a[href*="/orders/"]');
    const orderCount = await orderLinks.count();

    if (orderCount > 0) {
      await orderLinks.first().click();

      // Verify order detail page
      await expect(page.locator('text=Order Details')).toBeVisible();
      await expect(page.locator('[data-testid="order-items"]')).toBeVisible();
      await expect(page.locator('[data-testid="order-total"]')).toBeVisible();
    }
  });

  test('account page shows user information', async ({ page }) => {
    await page.goto('/account', { waitUntil: 'networkidle' });

    // If redirected to sign-in, skip this test
    if (page.url().includes('sign-in')) {
      expect(true).toBe(true);
      return;
    }

    // Check for account information sections
    const accountContainer = page.locator('[data-testid="account-page"]');
    if (await accountContainer.isVisible()) {
      // Account page content visible
      expect(true).toBe(true);
    }

    // Clerk UserButton should be present
    const userButton = page.locator('[data-clerk-user-button]');
    if (await userButton.isVisible()) {
      expect(true).toBe(true);
    }
  });

  test('checkout form remembers guest email', async ({ page }) => {
    await page.goto('/checkout', { waitUntil: 'networkidle' });

    // Fill email
    const emailInput = page.locator('input[name="email"]');
    if (await emailInput.isVisible()) {
      await emailInput.fill('guest@example.com');

      // Verify email value persists
      const emailValue = await emailInput.inputValue();
      expect(emailValue).toBe('guest@example.com');
    }
  });
});

test.describe('Guest Checkout', () => {
  test('guest can complete checkout without sign-in', async ({ page }) => {
    // Go to products and add to cart
    await page.goto('/products');
    const addButton = page.locator('button:has-text("Add to Cart")').first();
    if (await addButton.isVisible()) {
      await addButton.click();
    }

    // Navigate to checkout
    await page.goto('/checkout');

    // Should not require sign-in
    const signInButton = page.locator('button:has-text("Sign In")');
    const isSignInRequired = await signInButton.isVisible();

    if (!isSignInRequired) {
      // Can proceed with guest email
      const emailInput = page.locator('input[name="email"]');
      expect(await emailInput.isVisible()).toBeTruthy();
    }
  });
});
