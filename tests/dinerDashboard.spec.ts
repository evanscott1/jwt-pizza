import { test, expect } from 'playwright-test-coverage';
import { Role } from '../src/service/pizzaService';


test.describe('Diner Dashboard', () => {

  // Test Case 1: A user with NO order history
  test('should display a welcome message for a new user', async ({ page }) => {
    // --- Mocks for this specific test ---
    // Mock the user session to be logged in
    await page.route('*/**/api/user/me', async route => {
      await route.fulfill({
        status: 200,
        json: { 
          id: 'user-123', 
          name: 'Princess Leia', 
          email: 'leia@rebels.com',
          roles: [{ role: Role.Diner }]
        },
      });
    });
    // Mock the order history to be empty
    await page.route('*/**//api/order', async route => {
      await route.fulfill({ status: 200, json: { dinerId: 'user-123', orders: [] } });
    });

    // --- Actions and Assertions ---
    await page.goto('/diner-dashboard');

    await expect(page.getByTestId('user-name')).toHaveText('Princess Leia');
    await expect(page.getByTestId('user-email')).toHaveText('leia@rebels.com');
    await expect(page.getByText('How have you lived this long without having a pizza?')).toBeVisible();
    await expect(page.getByRole('link', { name: 'Buy one' })).toBeVisible();
    await expect(page.getByRole('table')).not.toBeVisible();
  });

  // Test Case 2: A user WITH an order history
  test('should display a table of past orders for a returning user', async ({ page }) => {
    // --- Mocks for this specific test ---
    // Mock the user session to be logged in
    await page.route('*/**/api/user/me', async route => {
      await route.fulfill({
        status: 200,
        json: { 
          id: 'user-123', 
          name: 'Princess Leia', 
          email: 'leia@rebels.com',
          roles: [{ role: Role.Diner }]
        },
      });
    });
    // Mock the order history to contain two orders
    await page.route('*/**/api/order', async route => {
      const mockOrderHistory = {
        dinerId: 'user-123',
        orders: [
          { id: 'order-abc', date: '2025-10-07T12:00:00.000Z', items: [{ price: 0.015 }] },
          { id: 'order-xyz', date: '2025-09-30T18:30:00.000Z', items: [{ price: 0.008 }] },
        ]
      };
      await route.fulfill({ status: 200, json: mockOrderHistory });
    });

    // --- Actions and Assertions ---
    await page.goto('/diner-dashboard');

    await expect(page.getByTestId('user-name')).toHaveText('Princess Leia');
    await expect(page.getByText('How have you lived this long without having a pizza?')).not.toBeVisible();
    
    const historyTable = page.getByRole('table');
    await expect(historyTable).toBeVisible();
    await expect(historyTable).toContainText('order-abc');
    await expect(historyTable).toContainText('0.015 ₿');
    await expect(historyTable).toContainText('order-xyz');
  });
});