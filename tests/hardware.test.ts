import { describe, expect, it } from "vitest";
import { hardwareDetector } from "../src/detectors/hardware.js";

const context = { run: async () => null };

describe("hardwareDetector", () => {
  it("reports core count", async () => {
    const findings = await hardwareDetector(8, 0)(context);
    expect(findings.find((f) => f.id === "hw.cores")?.value).toBe("8");
  });
  // New hardware tests go above this line.
});
