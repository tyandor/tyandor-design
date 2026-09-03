import { defineConfig, devices } from "@playwright/test";

const PORT = 4310;

/**
 * Visual verification for @tyandor/ui.
 *
 * Runs against the production build (`next start`), not the dev server:
 * dev-mode style injection differs from the built stylesheet, and it is the
 * built one that ships.
 */
export default defineConfig({
  testDir: "./test/visual",
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: process.env.CI ? [["github"], ["html", { open: "never" }]] : [["list"]],
  use: {
    baseURL: `http://127.0.0.1:${PORT}`,
    trace: "on-first-retry",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    // Assumes `bun run build:docs` has already run — CI builds the docs app
    // as its own step, so this reuses that output rather than rebuilding.
    command: "bun run --filter './apps/docs' start",
    url: `http://127.0.0.1:${PORT}`,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
