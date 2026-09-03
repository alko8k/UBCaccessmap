import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  use: {
    baseURL: "http://localhost:5173",
  },
  webServer: [
    {
      command: "npm run dev --workspace=api",
      url: "http://localhost:4000/api/health",
      reuseExistingServer: true,
    },
    {
      command: "npm run dev --workspace=web",
      url: "http://localhost:5173",
      reuseExistingServer: true,
    },
  ],
});
