import { test, expect } from 'playwright-test-coverage';

test.describe('About Page', () => {

  test('should display all static content correctly', async ({ page }) => {
    // 1. Navigate directly to the about page
    await page.goto('/about');

    // 2. Verify the main view title is visible
    // This comes from the <View title='The secret sauce'> component
    await expect(page.getByRole('heading', { name: 'The secret sauce' })).toBeVisible();

    // 3. Verify the "Our employees" subheading is present
    await expect(page.getByRole('heading', { name: 'Our employees' })).toBeVisible();

    // 4. Verify that a piece of the main text content is on the page
    await expect(page.getByText('At JWT Pizza, our amazing employees are the secret')).toBeVisible();

    // 5. Verify all four employee images are rendered
    const employeeImages = page.getByAltText('Employee stock photo');
    await expect(employeeImages).toHaveCount(4);
  });


test('should show a tooltip with the employee name on hover', async ({ page }) => {
  // 1. Navigate to the about page
  await page.goto('/about');

  // 2. Get all the employee images by their alt text
  const employeeImages = page.getByAltText('Employee stock photo');

  // 3. Hover over the first employee image
  await employeeImages.first().hover();

  // 4. Assert that the tooltip for "James" is now visible
  // The code gives the tooltip a `role="tooltip"`, which is the best way to find it.
  await expect(page.getByRole('tooltip', { name: 'James' })).toBeVisible();

  // 5. Hover over the second employee image to ensure state changes correctly
  await employeeImages.nth(1).hover();

  // 6. Assert the new tooltip "Maria" is visible
  await expect(page.getByRole('tooltip', { name: 'Maria' })).toBeVisible();

  // 7. (Optional but good) Assert the previous tooltip for "James" is now hidden
  await expect(page.getByRole('tooltip', { name: 'James' })).not.toBeVisible();
});

});