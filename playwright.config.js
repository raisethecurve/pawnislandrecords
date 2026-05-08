const { defineConfig, devices } = require("@playwright/test");

const port = Number(process.env.PAWN_SITE_PORT || 4173);
const baseURL = `http://127.0.0.1:${port}/`;

module.exports = defineConfig({
  testDir: "./tests",
  timeout: 45_000,
  expect: {
    timeout: 8_000
  },
  reporter: process.env.CI ? [["list"], ["html", { open: "never" }]] : [["list"]],
  use: {
    baseURL,
    trace: "retain-on-failure",
    screenshot: "only-on-failure"
  },
  webServer: {
    command: `npx http-server . -p ${port} -c-1 --silent`,
    url: baseURL,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000
  },
  projects: [
    {
      name: "desktop",
      use: {
        ...devices["Desktop Chrome"]
      }
    },
    {
      name: "mobile",
      use: {
        ...devices["Pixel 5"]
      }
    }
  ]
});
