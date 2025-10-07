import { test, expect } from 'playwright-test-coverage';

test.describe('History Page', () => {

  test('should display the history content correctly', async ({ page }) => {
    // 1. Navigate to the history page
    await page.goto('/history');

    // 2. Verify the main title is visible
    await expect(page.getByRole('heading', { name: 'Mama Rucci, my my' })).toBeVisible();

    // 3. Verify the image is visible
    // Note: For better accessibility and more robust testing, you could add
    // an alt attribute like alt="Mama Ricci" to the <img> tag.
    // Then you could use the more specific: page.getByAltText('Mama Ricci')
    const mamaRicciImage = page.getByAltText('An old photograph of Mama Ricci');

    await expect(mamaRicciImage).toBeVisible();

    // 4. Verify key text snippets from the page are present
    await expect(page.getByText("It all started in Mama Ricci's kitchen.")).toBeVisible();
    await expect(page.getByText('Fast forward to the 18th century in Naples, Italy')).toBeVisible();
    await expect(page.getByText('especially true if it comes from JWT Pizza!')).toBeVisible();
  });

});