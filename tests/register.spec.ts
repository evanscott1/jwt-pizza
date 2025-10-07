import { test, expect } from 'playwright-test-coverage';

test.describe('Registration Page', () => {

  // Test 1: The "Happy Path" for a successful registration
  test('should allow a user to register successfully', async ({ page }) => {
    // Intercept the POST request to the registration endpoint
  await page.route('*/**/api/auth', async route => {
    await route.fulfill({
      status: 201,
      json: { // 2. Updated JSON response shape
        user: { id: 123, name: 'Test User', email: 'test@example.com' },
        token: 'mock-jwt-token-12345'
      },
    });
  });

    // Navigate to the register page
    await page.goto('/register');

    // Fill out the registration form
    await page.getByLabel('Name').fill('Test User');
    await page.getByLabel('Email').fill('test@example.com');
    await page.getByLabel('Password').fill('password123');
    await page.getByRole('button', { name: 'Register' }).click();

    // Assert that the user is redirected to their dashboard after success
    await expect(page).toHaveURL('/');
    await expect(page.getByRole('heading', { name: 'The web\'s best pizza' })).toBeVisible();
  });

  // Test 2: The "Sad Path" for a duplicate email
  test('should show an error message if the email is already in use', async ({ page }) => {
    // Intercept the API call and mock an error response
    await page.route('*/**/api/auth', async route => {
      // Respond with a "409 Conflict" status and an error message
      await route.fulfill({
        status: 409,
        json: { message: 'This email address is already in use.' },
      });
    });

    // Navigate to the register page
    await page.goto('/register');

    // Fill out the form
    await page.getByLabel('Name').fill('Another User');
    await page.getByLabel('Email').fill('test@example.com');
    await page.getByLabel('Password').fill('password123');
    await page.getByRole('button', { name: 'Register' }).click();

    // Assert that the specific error message is now visible on the page
    await expect(page.getByText('This email address is already in use.')).toBeVisible();

    // Assert that the user was NOT redirected
    await expect(page).not.toHaveURL(/.*\/dashboard/);
  });
});