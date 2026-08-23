import { describe, expect, it } from "vitest";
import { ENV_FLAG_NAMES, envFlagDetector } from "../src/detectors/envflags.js";

const context = { run: async () => null };

describe("envFlagDetector", () => {
  it("never records a value", async () => {
    const env = Object.fromEntries(ENV_FLAG_NAMES.map((name) => [name, "/home/sam/secret"]));
    const findings = await envFlagDetector(env)(context);
    expect(JSON.stringify(findings)).not.toContain("secret");
    expect(findings.every((f) => f.value === "yes")).toBe(true);
  });

  it("reports null when unset", async () => {
    const findings = await envFlagDetector({})(context);
    expect(findings.every((f) => f.value === null)).toBe(true);
  });
});
