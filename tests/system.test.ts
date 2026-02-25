import { describe, expect, it } from "vitest";
import { systemDetectors, type SystemFacts } from "../src/detectors/system.js";

const facts = (overrides: Partial<SystemFacts> = {}): SystemFacts => ({
  env: {},
  eol: "\n",
  timeZone: "UTC",
  locale: "en-US",
  ...overrides,
});

const detect = async (overrides: Partial<SystemFacts> = {}) => {
  const context = { run: async () => null };
  const results = await Promise.all(
    systemDetectors(facts(overrides)).map((detector) => detector(context)),
  );
  return new Map(results.flat().map((f) => [f.id, f.value]));
};

describe("system detectors", () => {
  // New system tests go above this line.
  it("never reads an environment variable it was not asked for", async () => {
    const found = await detect({ env: { MY_SECRET: "hunter2" } });
    expect([...found.values()]).not.toContain("hunter2");
  });
});
