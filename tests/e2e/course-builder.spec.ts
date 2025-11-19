import { test, expect } from '@playwright/test';

test.describe('Course Creation Tool', () => {
    test('should allow creating and publishing a valid course', async ({ page }) => {
        try {
            page.on('console', msg => console.log('PAGE LOG:', msg.text()));
            page.on('pageerror', err => console.log('PAGE ERROR:', err));
            page.on('requestfailed', req => console.log('REQUEST FAILED:', req.url(), req.failure()?.errorText));
            page.on('response', resp => {
                if (resp.status() !== 200 && resp.status() !== 304) {
                    console.log('RESPONSE ERROR:', resp.url(), resp.status());
                }
            });

            // 1. Navigate to the app
            await page.goto('/', { waitUntil: 'commit' });

            // Try to manually import main.tsx to see error
            try {
                await page.evaluate(() => import('/src/main.tsx'));
                console.log('MANUAL IMPORT SUCCESS');
            } catch (e) {
                console.log('MANUAL IMPORT ERROR:', e);
            }

            // 2. Login as Admin
            // Wait for email input
            await page.getByLabel(/email address/i).fill('admin@gamelearn.test');
            await page.locator('#password').fill('Admin2024!');
            await page.getByRole('button', { name: /sign in/i }).click();

            // 3. Handle Password Change if needed
            // Check if we are on password change screen
            // It has heading "Create Your Password" or similar
            try {
                await expect(page.getByRole('heading', { name: /create your password/i })).toBeVisible({ timeout: 5000 });
                console.log('Password change required. Changing password...');
                await page.getByLabel(/new password/i).fill('NewAdminPass123!');
                await page.getByLabel(/confirm password/i).fill('NewAdminPass123!');
                await page.getByRole('button', { name: /change password/i }).click();
            } catch (e) {
                console.log('Password change not required or timed out checking.');
            }

            // 4. Navigate to Admin Panel
            // Wait for dashboard or admin button
            await expect(page.getByRole('button', { name: /admin/i })).toBeVisible({ timeout: 10000 });
            await page.getByRole('button', { name: /admin/i }).click();

            // Verify we are in Admin Panel
            await expect(page.getByRole('heading', { name: /admin panel/i })).toBeVisible();

            // 5. Create New Course
            const createButton = page.getByRole('button', { name: /create new course/i });
            if (await createButton.isVisible()) {
                await createButton.click();
            } else {
                await page.getByRole('tab', { name: /courses/i }).click();
                await page.getByRole('button', { name: /create new course/i }).click();
            }

            // 6. Fill in course details
            await page.getByLabel(/course title/i).fill('Playwright Test Course');
            await page.getByLabel(/description/i).fill('This is a test course created by Playwright.');
            await page.getByLabel(/category/i).fill('Testing');

            // 7. Add a lesson module
            await page.getByRole('tab', { name: /course structure/i }).click();
            await page.getByRole('button', { name: /add lesson/i }).click();

            // Edit the lesson
            await page.getByRole('button', { name: /edit/i }).last().click();

            // Inside WYSIWYGEditor
            await page.getByRole('textbox', { name: /enter your lesson content/i }).fill('Some valid content for the lesson.');
            await page.getByRole('button', { name: /save content/i }).click();

            // 8. Verify Publish
            await page.getByRole('tab', { name: /publishing settings/i }).click();

            // Check if checklist items are green (optional, skipping for speed)

            // Attempt publish
            await page.getByRole('button', { name: /publish course/i }).click();

            // Confirm dialog
            await page.getByRole('button', { name: /publish course/i, exact: true }).click();

            // Verify success
            await expect(page.getByText(/course published successfully/i)).toBeVisible();
        } catch (error) {
            console.log('TEST FAILED. Page Content:');
            console.log(await page.content());
            throw error;
        }
    });
});
