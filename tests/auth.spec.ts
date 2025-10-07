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

test.describe('Login Page', () => {

  // Test 1: The "Happy Path" for a successful login
  test('should allow a user to log in successfully', async ({ page }) => {
    // Mock the API response for a successful login (PUT request)
    await page.route('*/**/api/auth', async route => {
      // This mock only needs to handle the PUT request for this test
      if (route.request().method() === 'PUT') {
        await route.fulfill({
          status: 200, // OK
          json: {
            user: { id: 456, name: 'Darth Vader', email: 'darth@deathstar.com' },
            token: 'mock-jwt-token-for-darth-67890'
          },
        });
      }
    });

    // 1. Navigate to the login page
    await page.goto('/login');

    // 2. Fill out the form
    await page.getByLabel('Email address').fill('darth@deathstar.com');
    await page.getByLabel('Password').fill('ValidPassword123');
    await page.getByRole('button', { name: 'Login' }).click();

    // 3. Assert the user is redirected (e.g., to the home page or a dashboard)
    // We expect the URL to no longer be the login page.
    await expect(page).not.toHaveURL(/.*\/login/);

    // 4. Assert that the user's initials ("DV") are now visible in the header
    await expect(page.getByRole('link', { name: 'DV' })).toBeVisible();
  });

  // Test 2: The "Sad Path" for failed login
  test('should show an error message with invalid credentials', async ({ page }) => {
    // Mock the API response for a failed login
    await page.route('*/**/api/auth', async route => {
      if (route.request().method() === 'PUT') {
        await route.fulfill({
          status: 401, // Unauthorized
          json: { message: 'Invalid credentials. Try again.' },
        });
      }
    });

    // 1. Navigate to the login page
    await page.goto('/login');

    // 2. Fill out the form with incorrect details
    await page.getByLabel('Email address').fill('darth@deathstar.com');
    await page.getByLabel('Password').fill('WrongPassword');
    await page.getByRole('button', { name: 'Login' }).click();

    // 3. Assert the error message is visible
    // Your code uses `JSON.stringify(error)`, so we must check for the literal JSON string.
    await expect(page.getByText('Invalid credentials. Try again.')).toBeVisible();

    // 4. Assert the user is still on the login page
    await expect(page).toHaveURL(/.*\/login/);
  });

});

test.describe('Logout Flow', () => {

  test('should log out a user and redirect to the homepage', async ({ page }) => {
    // 1. SETUP: Start the test in a logged-in state.
    // We mock the initial user check to make the app think a user is logged in.
    await page.route('*/**/api/user/me', async route => {
      await route.fulfill({
        status: 200,
        json: { id: 456, name: 'Darth Vader', email: 'darth@deathstar.com' },
      });
    }, {times: 1});

        await page.route('/api/user/me', async route => {
      await route.fulfill({ status: 401 }); // Unauthorized
    });

    // Mock the DELETE request to the logout endpoint.
    // We can respond with a 204 "No Content" which is common for successful DELETEs.
    await page.route('/api/auth', async route => {
      if (route.request().method() === 'DELETE') {
        await route.fulfill({ status: 204 });
      }
    });

    // Start on the homepage to confirm the initial "logged-in" UI is correct
    await page.goto('/');
    // The user's initials ("DV") should be visible before logging out
    await expect(page.getByRole('link', { name: 'DV' })).toBeVisible();


    // 2. ACTION: Trigger the logout by navigating to the logout page.
    await page.goto('/logout');


    // 3. ASSERTION: Verify the user is logged out.
    // The user should be redirected to the homepage.
    await expect(page).toHaveURL(/.*\//); // Adjust if your base URL is different

    // The "Login" link should now be visible in the header.
    await expect(page.getByRole('link', { name: 'Login' })).toBeVisible();

    // The user's initials should no longer be visible.
    await expect(page.getByRole('link', { name: 'DV' })).not.toBeVisible();
  });

});
