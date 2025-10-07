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
