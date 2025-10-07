import { test, expect } from 'playwright-test-coverage';
import { Role } from '../src/service/pizzaService';


test.describe('Admin Dashboard', () => {

  // Test Case 1: A non-admin user tries to access the page
  test('should not display the dashboard for a non-admin user', async ({ page }) => {
    // Simulate a logged-in user who is NOT an admin
    await page.route('*/**/api/user/me', async route => {
      await route.fulfill({
        status: 200,
        json: { 
          id: 'user-diner', 
          name: 'Regular Diner', 
          email: 'diner@test.com',
          roles: [{ role: Role.Diner }] // The important part
        },
      });
    });

    await page.goto('/admin-dashboard');

    // Assert that the "Not Found" view is rendered instead of the dashboard
    await expect(page.getByRole('heading', { name: 'Oops' })).toBeVisible();
    await expect(page.getByRole('heading', { name: "Mama Ricci's kitchen" })).not.toBeVisible();
  });

  // Test Case 2: An admin user successfully views the dashboard
  test('should display the list of franchises for an admin user', async ({ page }) => {
    // Simulate a logged-in ADMIN user
    await page.route('*/**/api/user/me', async route => {
      await route.fulfill({
        status: 200,
        json: { 
          id: 'user-admin', 
          name: 'Super Admin', 
          email: 'admin@test.com',
          roles: [{ role: Role.Admin }]
        },
      });
    });

    // Mock the initial API call to fetch franchises (page 0)
    await page.route('**/api/franchise?page=0**', async route => {
      await route.fulfill({
        status: 200,
        json: {
          franchises: [{
            id: 'f-1',
            name: 'Pizza Planet',
            admins: [{ name: 'Buzz Lightyear' }],
            stores: [{ id: 's-1', name: 'Main Street', totalRevenue: 1000 }]
          }],
          more: true // 'more' is true, so the 'next' button should be enabled
        }
      });
    });

    await page.goto('/admin-dashboard');
    
    // Assert the admin view is visible
    await expect(page.getByRole('heading', { name: "Mama Ricci's kitchen" })).toBeVisible();

    // Assert the table contains the mocked franchise data
    const franchiseTable = page.getByRole('table');
    await expect(franchiseTable).toBeVisible();
    await expect(franchiseTable).toContainText('Pizza Planet');
    await expect(franchiseTable).toContainText('Buzz Lightyear');
    await expect(franchiseTable).toContainText('Main Street');
    await expect(franchiseTable).toContainText('1,000 ₿');
  });

  // Test Case 3: Pagination functionality
  test('should fetch the next page of franchises when pagination is clicked', async ({ page }) => {
    // Simulate a logged-in ADMIN user
    await page.route('*/**/api/user/me', async route => {
    await route.fulfill({
        status: 200,
        json: { 
        id: 'user-admin-007', 
        name: 'Super Admin', 
        email: 'admin@jwt.pizza',
        roles: [{ role: Role.Admin }] // The critical part for authorization
        },
    });
    });

    // Mock the initial API call to fetch franchises for page 0
    await page.route('*/**/api/franchise?page=0**', async route => {
    await route.fulfill({
        status: 200,
        json: {
        franchises: [{
            id: 'f-main-street',
            name: 'Main Street Pizza Co.',
            admins: [{ name: 'Jane Doe' }],
            stores: [{ id: 's-main-1', name: 'Downtown Location', totalRevenue: 75000 }]
        }],
        more: true // This is essential for enabling the 'next' button in the test
        }
    });
    });

    // Set up a promise that will resolve when the page 1 API call is made
    const page1RequestPromise = page.waitForRequest('**/api/franchise?page=1**');

    await page.goto('/admin-dashboard');

    // The "next page" button should be enabled
    const nextPageButton = page.getByRole('button', { name: '»' });
    await expect(nextPageButton).toBeEnabled();

    // Click the "next page" button
    await nextPageButton.click();

    // Wait for the API call for page 1 to happen and confirm it was called
    const page1Request = await page1RequestPromise;
    expect(page1Request).toBeDefined();
  });

  // Test Case 4: Filtering functionality
  test('should fetch filtered franchises when the filter is submitted', async ({ page }) => {
    // Simulate a logged-in ADMIN user
    await page.route('*/**/api/user/me', async route => {
    await route.fulfill({
        status: 200,
        json: { 
        id: 'user-admin-007', 
        name: 'Super Admin', 
        email: 'admin@jwt.pizza',
        roles: [{ role: Role.Admin }] // The critical part for authorization
        },
    });
    });

    // Mock the initial API call to fetch franchises for page 0
    await page.route('*/**/api/franchise?page=0**', async route => {
    await route.fulfill({
        status: 200,
        json: {
        franchises: [{
            id: 'f-main-street',
            name: 'Main Street Pizza Co.',
            admins: [{ name: 'Jane Doe' }],
            stores: [{ id: 's-main-1', name: 'Downtown Location', totalRevenue: 75000 }]
        }],
        more: true // This is essential for enabling the 'next' button in the test
        }
    });
    });

    // Set up a promise that waits for the API call with the filter parameter
    const filterRequestPromise = page.waitForRequest('**/api/franchise?**name=*Planet*');

    await page.goto('/admin-dashboard');

    // Fill the filter input and click submit
    await page.getByPlaceholder('Filter franchises').fill('Planet');
    await page.getByRole('button', { name: 'Submit' }).click();

    // Wait for the API call with the filter to happen and confirm it was made
    const filterRequest = await filterRequestPromise;
    expect(filterRequest).toBeDefined();
  });
});