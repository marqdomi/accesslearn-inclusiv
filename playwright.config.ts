import { defineConfig } from '@playwright/test'

// Run the Vite dev server and reuse it across tests
export default defineConfig({
  testDir: 'tests/e2e',
  timeout: 60_000,
  expect: { timeout: 10_000 },
  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL || 'http://127.0.0.1:5000',
    headless: false,
    trace: 'on-first-retry',
  },
  /* webServer: {
    command: 'bash -lc "npm run kill || true; npm run dev -- --strictPort"',
    url: 'http://localhost:5000',
    reuseExistingServer: true,
    stdout: 'pipe',
    stderr: 'pipe',
    timeout: 60_000,
  }, */
  reporter: [['list']]
})
