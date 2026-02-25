import { describe, expect, it } from "vitest";
import { osDetector } from "../src/detectors/os.js";

describe("osDetector", () => {
  it("reports only platform, release and architecture", async () => {
    const findings = await osDetector({ run: async () => null });
    expect(findings.map((f) => f.id)).toEqual([
      "os.platform",
      "os.release",
      "os.arch",
    ]);
  });
});
