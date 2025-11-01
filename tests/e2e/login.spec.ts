// @ts-nocheck
import { test, expect } from '@playwright/test'

const SAMPLE_CREDENTIALS = [
  {
    id: 'admin-001',
    email: 'admin@gamelearn.test',
    temporaryPassword: 'Admin2024!',
    firstName: 'Admin',
    lastName: 'User',
    department: 'IT',
    role: 'admin',
    status: 'activated',
    createdAt: Date.now(),
  },
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
  {
    id: 'user-002',
    email: 'mike.chen@gamelearn.test',
    temporaryPassword: 'Welcome123!',
    firstName: 'Mike',
    lastName: 'Chen',
    department: 'Engineering',
    role: 'employee',
    status: 'activated',
    createdAt: Date.now(),
  },
  {
    id: 'user-003',
    email: 'emma.rodriguez@gamelearn.test',
    temporaryPassword: 'Welcome123!',
    firstName: 'Emma',
    lastName: 'Rodriguez',
    department: 'Marketing',
    role: 'employee',
    status: 'activated',
    createdAt: Date.now(),
  },
] as const

async function seedCredentials(page) {
  await page.addInitScript((creds) => {
    // Ensure spark kv exists (provided by plugin at runtime)
    // We wait a tick after navigation to guarantee window.spark is ready.
    (window as any).__seedCreds = creds
  }, SAMPLE_CREDENTIALS)
}

async function writeCredsIntoKV(page) {
  // Write into KV as soon as spark is available on the page
  await page.evaluate(async (creds) => {
    const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))
    for (let i = 0; i < 20; i++) {
      if ((window as any).spark?.kv?.set) break
      await sleep(100)
    }
    if (!(window as any).spark?.kv?.set) {
      throw new Error('spark.kv not available')
    }
    await (window as any).spark.kv.set('employee-credentials', creds)
    await (window as any).spark.kv.delete?.('auth-session')
    await (window as any).spark.kv.delete?.('user-profiles')
  }, SAMPLE_CREDENTIALS)
}

const users = SAMPLE_CREDENTIALS.map(c => ({ email: c.email, password: c.temporaryPassword }))

test.describe('Login flow for all users', () => {
  for (const user of users) {
    test(`${user.email} can login to password change screen`, async ({ browser, baseURL }) => {
      const context = await browser.newContext()
      const page = await context.newPage()

      await seedCredentials(page)
      await page.goto(baseURL || '/')
      await writeCredsIntoKV(page)

      // Fill login form
  await page.getByLabel('Email Address').fill(user.email)
  await page.locator('#password').fill(user.password)
      await page.getByRole('button', { name: 'Sign In' }).click()

      // Expect to land on Password Change Screen
      await expect(page.getByRole('heading', { name: 'Create Your Password' })).toBeVisible()

      // Close this context to isolate per-user state
      await context.close()
    })
  }

  test('Invalid password shows an error', async ({ browser, baseURL }) => {
    const context = await browser.newContext()
    const page = await context.newPage()

    await seedCredentials(page)
    await page.goto(baseURL || '/')
    await writeCredsIntoKV(page)

  await page.getByLabel('Email Address').fill('admin@gamelearn.test')
  await page.locator('#password').fill('WrongPass!')
    await page.getByRole('button', { name: 'Sign In' }).click()

    await expect(page.getByText('Invalid email or password')).toBeVisible()

    await context.close()
  })
})
