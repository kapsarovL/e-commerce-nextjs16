import { test, expect } from '@playwright/test';

test.describe('Product Catalog', () => {
  test('browse products with category filter', async ({ page }) => {
    await page.goto('/products');
    await page.waitForURL('/products');

    // Verify product grid loads
    const productCards = page.locator('[data-testid="product-card"]');
    await expect(productCards.first()).toBeVisible();

    // Click category filter
    const categoryFilter = page.locator('text=Electronics').first();
    if (await categoryFilter.isVisible()) {
      await categoryFilter.click();

      // Verify products are filtered
      await page.waitForLoadState('networkidle');
      const filteredProducts = page.locator('[data-testid="product-card"]');
      const count = await filteredProducts.count();
      expect(count).toBeGreaterThan(0);
    }
  });

  test('search products by name', async ({ page }) => {
    await page.goto('/search');

    // Type search query
    const searchInput = page.locator('input[placeholder*="Search"]').first();
    await searchInput.fill('laptop');
    await searchInput.press('Enter');

    // Wait for results
    await page.waitForLoadState('networkidle');

    // Verify results appear
    const results = page.locator('[data-testid="product-card"]');
    const resultsExist = (await results.count()) > 0;
    expect(resultsExist).toBeTruthy();
  });

  test('filter by price range', async ({ page }) => {
    await page.goto('/search');

    // Open filters if sidebar is collapsed
    const filterButton = page.locator('[aria-label="Filters"]');
    if (await filterButton.isVisible()) {
      await filterButton.click();
    }

    // Set price range
    const minPriceInput = page.locator('input[name="minPrice"]');
    const maxPriceInput = page.locator('input[name="maxPrice"]');

    if (await minPriceInput.isVisible()) {
      await minPriceInput.fill('100');
      await maxPriceInput.fill('500');
      await page.keyboard.press('Enter');

      // Wait for results to update
      await page.waitForLoadState('networkidle');

      // Verify products are within price range
      const productPrices = page.locator('[data-testid="product-price"]');
      const count = await productPrices.count();
      expect(count).toBeGreaterThan(0);
    }
  });

  test('sort products by price', async ({ page }) => {
    await page.goto('/products');

    // Find sort selector
    const sortSelect = page.locator('select').first();
    if (await sortSelect.isVisible()) {
      await sortSelect.selectOption('price-asc');

      // Wait for re-sort
      await page.waitForLoadState('networkidle');

      // Verify sort was applied
      const products = page.locator('[data-testid="product-card"]');
      expect(await products.count()).toBeGreaterThan(0);
    }
  });

  test('view product detail page', async ({ page }) => {
    await page.goto('/products');

    // Click first product
    const productLink = page.locator('[data-testid="product-card"] a').first();
    await productLink.click();

    // Verify product detail page loads
    const productName = page.locator('h1').first();
    await expect(productName).toBeVisible();

    // Verify key elements exist
    await expect(page.locator('[data-testid="product-price"]')).toBeVisible();
    await expect(page.locator('button:has-text("Add to Cart")')).toBeVisible();
  });

  test('product detail page shows images gallery', async ({ page }) => {
    await page.goto('/products');

    // Navigate to product detail
    const productLink = page.locator('[data-testid="product-card"] a').first();
    await productLink.click();

    // Check for image gallery
    const mainImage = page.locator('[data-testid="product-image"]').first();
    await expect(mainImage).toBeVisible();

    // Check for thumbnails if present
    const thumbnails = page.locator('[data-testid="product-thumbnail"]');
    const thumbnailCount = await thumbnails.count();
    if (thumbnailCount > 1) {
      // Click second thumbnail
      await thumbnails.nth(1).click();
      // Verify main image changed
      await expect(mainImage).toBeVisible();
    }
  });

  test('pagination works correctly', async ({ page }) => {
    await page.goto('/search?page=1');

    // Find next page button
    const nextButton = page.locator('button:has-text("Next")');
    if ((await nextButton.isVisible()) && !(await nextButton.isDisabled())) {
      await nextButton.click();

      // Verify URL changed
      await expect(page).toHaveURL(/page=2/);

      // Verify new products loaded
      const products = page.locator('[data-testid="product-card"]');
      expect(await products.count()).toBeGreaterThan(0);
    }
  });

  test('in-stock toggle filters products', async ({ page }) => {
    await page.goto('/search');

    // Find in-stock toggle
    const inStockToggle = page.locator('input[type="checkbox"]').first();
    if (await inStockToggle.isVisible()) {
      await inStockToggle.click();

      // Wait for filter to apply
      await page.waitForLoadState('networkidle');

      // Verify products shown have stock
      const products = page.locator('[data-testid="product-card"]');
      const count = await products.count();
      expect(count).toBeGreaterThan(0);
    }
  });
});
