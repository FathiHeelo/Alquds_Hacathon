import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["tests/**/*.test.ts"],
    globalSetup: ["tests/globalSetup.ts"],
    fileParallelism: false,
    testTimeout: 30_000,
    env: {
      NODE_ENV: "test",
      JWT_SECRET: "test-secret"
    }
  }
});
