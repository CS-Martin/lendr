import { defineConfig, devices } from '@playwright/test';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the current file's directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Use process.env.PORT by default and fallback to 8080
const PORT = process.env.PORT || 8080;

// Set webServer.url and use 'localhost' to resolve the IP address
const baseURL = `http://localhost:${PORT}`;

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  timeout: 30 * 1000,
  testDir: path.join(__dirname, 'tests'),
  retries: 2,
  outputDir: 'test-results/',

  // Run your local dev server before starting the tests:
  // https://playwright.dev/docs/test-advanced#launching-a-development-web-server-during-the-tests
  webServer: {
    command: 'pnpm dev',
    url: baseURL,
    timeout: 120 * 1000,
    reuseExistingServer: !process.env.CI,
    stdout: 'pipe',
    stderr: 'pipe',
    env: {
      NODE_ENV: 'test',
      PORT: PORT.toString(),
    },
  },

  use: {
    // Use baseURL so to make navigation relative.
    // More information: https://playwright.dev/docs/api/class-testoptions#test-options-base-url
    baseURL,

    // All failed tests should create a trace file
    trace: 'on-first-retry',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
  ],
});
