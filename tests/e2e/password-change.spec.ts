// @ts-nocheck
import { test, expect } from '@playwright/test'

const USER = {
  email: 'sarah.johnson@gamelearn.test',
  temp: 'Welcome123!',
}

const NEW_PASS = 'StrongPass123!'

async function ensureCreds(page) {
  await page.evaluate(async () => {
    const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
    for (let i = 0; i < 50; i++) {
      if (window.spark?.kv?.get && window.spark?.kv?.set) break
      await sleep(50)
    }
    const creds = await window.spark.kv.get('employee-credentials')
    if (!Array.isArray(creds) || creds.length === 0) {
      await window.spark.kv.set('employee-credentials', [
        {
          id: 'user-001',
          email: 'sarah.johnson@gamelearn.test',
          temporaryPassword: 'Welcome123!',
          firstName: 'Sarah',
          lastName: 'Johnson',
          department: 'Sales',
          role: 'employee',
          status: 'activated',
          createdAt: Date.now(),
        },
      ])
    }
    await window.spark.kv.delete?.('auth-session')
    await window.spark.kv.delete?.('user-profiles')
  })
}

test('can change password and proceed to onboarding', async ({ page, baseURL }) => {
  await page.goto(baseURL || '/')
  await ensureCreds(page)

  await page.getByLabel('Email Address').fill(USER.email)
  await page.locator('#password').fill(USER.temp)
  await page.getByRole('button', { name: 'Sign In' }).click()

  // Should be on password change screen
  await expect(page.getByRole('heading', { name: 'Create Your Password' })).toBeVisible()

  // Fill out change form
  await page.getByLabel('Current Temporary Password').fill(USER.temp)
  await page.locator('#new-password').fill(NEW_PASS)
  await page.locator('#confirm-password').fill(NEW_PASS)
  await page.getByRole('button', { name: 'Change Password & Continue' }).click()

  // Expect onboarding screen
  await expect(page.getByRole('heading', { name: 'Welcome to GameLearn!' })).toBeVisible()
})
