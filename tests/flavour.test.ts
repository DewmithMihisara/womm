import { describe, expect, it } from "vitest";
import { flavourDetector } from "../src/detectors/flavour.js";

describe("flavourDetector", () => {
  it("recognises GNU tools", async () => {
    const findings = await flavourDetector({ run: async () => "sed (GNU sed) 4.9" });
    expect(findings.find((f) => f.id === "gnu.sed")?.value).toBe("yes");
  });

  it("reports null for tools that fail on --version", async () => {
    const findings = await flavourDetector({ run: async () => null });
    expect(findings.find((f) => f.id === "gnu.sed")?.value).toBeNull();
  });

  it("reports null for other implementations", async () => {
    const findings = await flavourDetector({ run: async () => "bsdtar 3.5.3" });
    expect(findings.find((f) => f.id === "gnu.sed")?.value).toBeNull();
  });
});
