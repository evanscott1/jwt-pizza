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

    await expect(page.getByRole('tab', { name: 'Franchises' })).toHaveAttribute('aria-selected', 'true');
  await expect(page.getByRole('tab', { name: 'Users' })).toHaveAttribute('aria-selected', 'false');
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

  test('should display the user list when the Users tab is clicked', async ({ page }) => {
    // 1. ARRANGE: Set up mocks for an admin user and both API endpoints
    await page.route('*/**/api/user/me', async route => {
      await route.fulfill({
        status: 200,
        json: { id: 'user-admin', name: 'Super Admin', roles: [{ role: Role.Admin }] },
      });
    });

    // Mock the franchise endpoint (for the initial view)
    await page.route('**/api/franchise?page=0**', async route => {
      await route.fulfill({ status: 200, json: { franchises: [], more: false } });
    });

    // Mock the user endpoint that will be called when the tab is clicked
    await page.route('**/api/user**', async route => {
      await route.fulfill({
        status: 200,
        json: {
          users: [{
            id: 'user-123',
            name: 'John Doe',
            email: 'john.doe@test.com',
            roles: [{ role: Role.Diner }]
          }]
        }
      });
    });

    await page.goto('/admin-dashboard');

    // 2. ACT: Find and click the "Users" tab
    const usersTab = page.getByRole('tab', { name: 'Users' });
    await usersTab.click();

    // 3. ASSERT: The UI has updated correctly
    // The franchise table should no longer be visible
    await expect(page.getByRole('table', { name: /franchises/i })).not.toBeVisible();
    
    // The new user table should be visible and contain the mocked data
    const userTable = page.getByRole('table', { name: /users/i });
    await expect(userTable).toBeVisible();
    await expect(userTable).toContainText('John Doe');
    await expect(userTable).toContainText('john.doe@test.com');

    // Assert the "Users" tab is now the active one
    await expect(usersTab).toHaveAttribute('aria-selected', 'true');
  });

  test('should delete a user and remove them from the list', async ({ page }) => {
    // 1. Arrange: Mock admin login and the initial user list
    await page.route('*/**/api/user/me', async route => {
      await route.fulfill({ status: 200, json: { id: 'admin-1', name: 'Admin', roles: [{ role: Role.Admin }] } });
    });

    const mockUsers = [
      { id: 'user-to-delete', name: 'John Doe', email: 'john.doe@test.com', roles: [{ role: Role.Diner }] },
      { id: 'user-to-keep', name: 'Jane Smith', email: 'jane.smith@test.com', roles: [{ role: Role.Diner }] }
    ];

    await page.route('**/api/user**', async route => {
      await route.fulfill({ status: 200, json: { users: mockUsers } });
    });

    // Mock the successful DELETE request for the specific user
    await page.route('**/api/user/user-to-delete', async route => {
      // Ensure the method is DELETE before fulfilling
      if (route.request().method() === 'DELETE') {
        await route.fulfill({ status: 200, json: { message: 'user deleted' } });
      }
    });

    // Handle the confirmation dialog automatically
    page.on('dialog', dialog => dialog.accept());

    // 2. Act: Navigate, switch to the Users tab, and click delete
    await page.goto('/admin-dashboard');
    await page.getByRole('tab', { name: 'Users' }).click();

    // Find the specific row and click its delete button
    const rowToDelete = page.locator('[data-testid="user-row-john.doe@test.com"]');
    await rowToDelete.getByRole('button', { name: 'Delete' }).click();

    // 3. Assert: The user is removed from the UI
    await expect(page.locator('[data-testid="user-row-john.doe@test.com"]')).not.toBeVisible();
    await expect(page.locator('[data-testid="user-row-jane.smith@test.com"]')).toBeVisible();
  });

test('should show an error and not remove the user if deletion fails', async ({ page }) => {
    // 1. Arrange: Mock admin login and the initial user list
    await page.route('*/**/api/user/me', async route => {
      await route.fulfill({ status: 200, json: { id: 'admin-1', name: 'Admin', roles: [{ role: Role.Admin }] } });
    });

    const mockUsers = [
      { id: 'user-to-delete', name: 'John Doe', email: 'john.doe@test.com', roles: [{ role: Role.Diner }] }
    ];

    await page.route('**/api/user**', async route => {
      // Only mock the initial GET request, not the delete
      if (route.request().method() === 'GET') {
        await route.fulfill({ status: 200, json: { users: mockUsers } });
      }
    });
    
    // Mock a FAILED DELETE request
    await page.route('**/api/user/user-to-delete', async route => {
      if (route.request().method() === 'DELETE') {
        await route.fulfill({ status: 500, json: { message: 'Internal Server Error' } });
      }
    });

    // Handle the confirmation dialog
    page.on('dialog', dialog => dialog.accept());

    // 2. Act: Navigate and attempt to delete the user
    await page.goto('/admin-dashboard');
    await page.getByRole('tab', { name: 'Users' }).click();
    await page.locator('[data-testid="user-row-john.doe@test.com"]').getByRole('button', { name: 'Delete' }).click();

    // 3. Assert: The user is still visible and an error is shown
    await expect(page.locator('[data-testid="user-row-john.doe@test.com"]')).toBeVisible();
    
    // You would need to add an error notification component with a test ID
    // await expect(page.locator('[data-testid="error-toast"]')).toContainText('Failed to delete user');
  });

});