import { test, expect } from 'playwright-test-coverage';
import { Role } from '../src/service/pizzaService';

test.describe('Franchise Dashboard', () => {

  // Test Case 1: User does NOT have a franchise
  test('should display the "whyFranchise" view for a user with no franchise', async ({ page }) => {
    // Simulate a logged-in franchisee
    await page.route('*/**/api/user/me', async route => {
      await route.fulfill({
        status: 200,
        json: { 
          id: 'user-han-solo', 
          name: 'Han Solo', 
          email: 'han@falcon.com',
          roles: [{ role: Role.Franchisee }]
        },
      });
    });

    // Mock the API to return an empty array, simulating no franchise ownership
    await page.route('/api/franchise/user-han-solo', async route => {
      await route.fulfill({ status: 200, json: [] });
    });

    await page.goto('/franchise-dashboard');

    await expect(page.getByRole('heading', { name: 'So you want a piece of the pie?' })).toBeVisible();
    await expect(page.getByText('Now is the time to get in on the JWT Pizza tsunami.')).toBeVisible();
    await expect(page.getByRole('link', { name: 'login' })).toBeVisible();
  });

  // Test Case 2: User OWNS a franchise
  test('should display the store management view for a user with a franchise', async ({ page }) => {
    // Simulate a logged-in franchisee
    await page.route('*/**/api/user/me', async route => {
      await route.fulfill({
        status: 200,
        json: { 
          id: 'user-han-solo', 
          name: 'Han Solo', 
          email: 'han@falcon.com',
          roles: [{ role: Role.Franchisee }]
        },
      });
    });

    // Mock the API to return a franchise with two stores
    await page.route('*/**/api/franchise/user-han-solo', async route => {
      const mockFranchise = [{
        id: 'franchise-123',
        name: 'Han\'s Pizza Cantina',
        stores: [
          { id: 'store-a', name: 'Mos Eisley Outlet', totalRevenue: 50000 },
          { id: 'store-b', name: 'Cloud City Kiosk', totalRevenue: 120000 },
        ]
      }];
      await route.fulfill({ status: 200, json: mockFranchise });
    });

    await page.goto('/franchise-dashboard');

    await expect(page.getByRole('heading', { name: 'Han\'s Pizza Cantina' })).toBeVisible();
    const storeTable = page.getByRole('table');
    await expect(storeTable).toBeVisible();
    await expect(storeTable).toContainText('Mos Eisley Outlet');
    await expect(storeTable).toContainText('120,000 ₿');
    await expect(page.getByRole('button', { name: 'Create store' })).toBeVisible();
  });

  // Test Case 3: Button interactions
  test('should navigate to the correct pages when action buttons are clicked', async ({ page }) => {
    // Simulate a logged-in franchisee
    await page.route('*/**/api/user/me', async route => {
      await route.fulfill({
        status: 200,
        json: { 
          id: 'user-han-solo', 
          name: 'Han Solo', 
          email: 'han@falcon.com',
          roles: [{ role: Role.Franchisee }]
        },
      });
    });

    // Use the same mock as the test above to render the dashboard view
    await page.route('*/**/api/franchise/user-han-solo', async route => {
      const mockFranchise = [{
        id: 'franchise-123',
        name: 'Han\'s Pizza Cantina',
        stores: [{ id: 'store-a', name: 'Mos Eisley Outlet', totalRevenue: 50000 }]
      }];
      await route.fulfill({ status: 200, json: mockFranchise });
    });
    
    await page.goto('/franchise-dashboard');

    // Test the "Create store" button
    await page.getByRole('button', { name: 'Create store' }).click();
    await expect(page).toHaveURL(/.*\/franchise-dashboard\/create-store/);

    // Go back to test the other button
    await page.goBack();

    // Test the "Close" button for a specific store
    await page.getByRole('button', { name: 'Close' }).click();
    await expect(page).toHaveURL(/.*\/franchise-dashboard\/close-store/);
  });
});