import { test, expect } from '@playwright/test';

test('home page title', async ({ page }) => {
  await page.goto('http://localhost:5173');
  await expect(page).toHaveTitle(/ERLB/);
});
