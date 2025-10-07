import { test, expect } from 'playwright-test-coverage';

test.describe('Not Found Page (404)', () => {

  test('should display the correct 404 page content', async ({ page }) => {
    // 1. Navigate to a URL that is guaranteed not to exist
    await page.goto('/this-page-is-definitely-not-real');

    // 2. Assert that the main heading is "Oops"
    await expect(page.getByRole('heading', { name: 'Oops' })).toBeVisible();

    // 3. Assert that the specific helper text is visible
    await expect(
      page.getByText('It looks like we have dropped a pizza on the floor. Please try another page.')
    ).toBeVisible();
  });

});