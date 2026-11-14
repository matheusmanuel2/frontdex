import { defineConfig, devices } from '@playwright/test';

const PORT = Number(process.env.PORT ?? 3100);
const DEV_PORT = Number(process.env.DEV_PORT ?? 3101);

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? 'github' : 'list',
  use: {
    trace: 'retain-on-failure',
  },
  projects: [
    // Os testes do site correm sempre contra o build de produção.
    {
      name: 'chromium',
      testIgnore: /\.dev\.spec\.ts$/,
      use: { ...devices['Desktop Chrome'], baseURL: `http://localhost:${PORT}` },
    },
    // Páginas só de desenvolvimento (/_design) correm contra `next dev`.
    {
      name: 'dev',
      testMatch: /\.dev\.spec\.ts$/,
      use: { ...devices['Desktop Chrome'], baseURL: `http://localhost:${DEV_PORT}` },
    },
  ],
  webServer: [
    {
      command: `pnpm build && pnpm start --port ${PORT}`,
      url: `http://localhost:${PORT}`,
      reuseExistingServer: !process.env.CI,
      timeout: 180_000,
    },
    {
      command: `pnpm exec next dev --port ${DEV_PORT}`,
      url: `http://localhost:${DEV_PORT}`,
      reuseExistingServer: !process.env.CI,
      timeout: 180_000,
    },
  ],
});
