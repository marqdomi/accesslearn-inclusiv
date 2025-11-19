import { test, expect } from '@playwright/test';

test('should be able to access external site', async ({ page }) => {
    await page.goto('https://example.com');
    await expect(page).toHaveTitle(/Example Domain/);
});
