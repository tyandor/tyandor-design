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
    // Deliberately false everywhere, not just in CI. A `next start` left
    // running from an earlier session keeps serving the CSS hash baked into
    // its own build; once .next is rebuilt that file 404s, every custom
    // property goes undefined, and the colour probes read black in both
    // themes. Worse, before a rebuild it reports a confident pass for code
    // that is not on disk. A few seconds per run is cheaper than a suite
    // that lies about which build it checked.
    reuseExistingServer: false,
    timeout: 120_000,
  },
});
