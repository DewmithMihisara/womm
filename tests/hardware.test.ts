import { describe, expect, it } from "vitest";
import { hardwareDetector } from "../src/detectors/hardware.js";

const context = { run: async () => null };

describe("hardwareDetector", () => {
  it("reports core count", async () => {
    const findings = await hardwareDetector(8, 0)(context);
    expect(findings.find((f) => f.id === "hw.cores")?.value).toBe("8");
  });
  it("rounds memory to whole gigabytes", async () => {
    const findings = await hardwareDetector(8, 16.4 * 1024 ** 3)(context);
    expect(findings.find((f) => f.id === "hw.memory")?.value).toBe("16");
  });
  // New hardware tests go above this line.
});
