import { loadEnvConfig } from "@next/env";
import { defineConfig, devices } from "@playwright/test";

loadEnvConfig(process.cwd());

if (process.env.E2E_SUPABASE_URL) {
  process.env.NEXT_PUBLIC_SUPABASE_URL = process.env.E2E_SUPABASE_URL;
}

if (process.env.E2E_SUPABASE_PUBLISHABLE_KEY) {
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY =
    process.env.E2E_SUPABASE_PUBLISHABLE_KEY;
}

const baseURL = "http://127.0.0.1:3100";

export default defineConfig({
  testDir: "./e2e",
  testMatch: /pwa-offline\.spec\.ts/,
  timeout: 90_000,
  expect: {
    timeout: 15_000,
  },
  fullyParallel: false,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  workers: 1,
  reporter: [
    ["list"],
    ["html", { open: "never", outputFolder: "playwright-report-pwa" }],
  ],
  use: {
    ...devices["Desktop Chrome"],
    baseURL,
    screenshot: "only-on-failure",
    serviceWorkers: "allow",
    trace: process.env.CI ? "off" : "retain-on-failure",
  },
  webServer: {
    command:
      "exec node node_modules/next/dist/bin/next start --hostname 127.0.0.1 --port 3100",
    reuseExistingServer: false,
    timeout: 180_000,
    url: `${baseURL}/login`,
  },
  projects: [
    {
      name: "pwa-chromium",
    },
  ],
});
