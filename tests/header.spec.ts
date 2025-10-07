import { test, expect } from 'playwright-test-coverage';
import { type Page } from '@playwright/test';


async function setupAsGuest(page: Page) {
  // Mock the user endpoint to return null, simulating a guest
  await page.route('*/**/api/user/me', async (route) => {
    await route.fulfill({ json: null });
  });

  // Mock other initial API calls the app might make on load
  await page.route(/\/api\/franchise(\?.*)?$/, async (route) => {
    await route.fulfill({ json: { franchises: [] } });
  });

  // Navigate to the home page
  await page.goto('/');
}


test.describe('Header Component: As an Unauthenticated User', () => {

  test('should display public navigation links', async ({ page }) => {
    // 1. Arrange: Set up the mock environment
    await setupAsGuest(page);

    // 2. Assert: Check that links for guests are visible
    await expect(page.getByRole('link', { name: 'Home' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Order' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Login' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Register' })).toBeVisible();
  });

  test('should NOT display links for authenticated users', async ({ page }) => {
    // 1. Arrange
    await setupAsGuest(page);

    // 2. Assert
    await expect(page.getByRole('link', { name: 'Logout' })).not.toBeVisible();
    await expect(page.getByRole('link', { name: 'Admin' })).not.toBeVisible();
    await expect(page.getByRole('link', { name: 'Diner' })).not.toBeVisible();
  });

});