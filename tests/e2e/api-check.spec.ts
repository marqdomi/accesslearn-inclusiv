import { test, expect } from '@playwright/test';

test('should be able to access server via API', async ({ request }) => {
    const response = await request.get('http://127.0.0.1:5000/');
    console.log('Response status:', response.status());
    expect(response.ok()).toBeTruthy();
});
