import { test, expect } from 'playwright-test-coverage';

test('updateUser', async ({ page }) => {

  await page.route('*/**/api/auth', async route => {
    await route.fulfill({
      status: 201,
      json: { // 2. Updated JSON response shape
        user: { id: 123, name: 'pizza diner', email: 'test@example.com' },
        token: 'mock-jwt-token-12345'
      },
    });
  });

  const email = 'test@example.com';
  await page.goto('/');
  await page.getByRole('link', { name: 'Register' }).click();
  await page.getByPlaceholder('Full name').fill('pizza diner');
  await page.getByRole('textbox', { name: 'Email address' }).fill(email);
  await page.getByRole('textbox', { name: 'Password' }).fill('diner');
  await page.getByRole('button', { name: 'Register' }).click();

  await page.getByRole('link', { name: 'pd' }).click();

  await expect(page.getByRole('main')).toContainText('pizza diner');

  await page.getByRole('button', { name: 'Edit' }).click();
await expect(page.locator('h3')).toContainText('Edit user');
await page.getByRole('button', { name: 'Update' }).click();

await page.waitForSelector('[role="dialog"].hidden', { state: 'attached' });

await expect(page.getByRole('main')).toContainText('pizza diner');
});