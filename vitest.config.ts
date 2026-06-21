import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["tests/**/*.test.ts"],
    // Some tests run real snapshots, which launch many processes at once.
    testTimeout: 30000,
  },
});
