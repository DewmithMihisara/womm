import { describe, expect, it } from "vitest";
import { checkRequirements } from "../src/project/check.js";

const check = (range: string, value: string | null, tool = "node") =>
  checkRequirements([{ tool, range, source: "x" }], [
    { id: "node", label: "Node.js", value },
  ])[0]?.status;

describe("checkRequirements", () => {
  it("reports a satisfied range", () => {
    expect(check(">=20", "22.1.0")).toBe("met");
  });

  it("reports an unsatisfied range", () => {
    expect(check(">=20", "18.0.0")).toBe("unmet");
  });

  it("treats a partial pin as matching its patch releases", () => {
    expect(check("20.10", "20.10.7")).toBe("met");
    expect(check("20.10", "20.11.0")).toBe("unmet");
  });

  it("handles detected versions with only two parts", () => {
    expect(check(">=5", "5.9")).toBe("met");
  });

  it("reports a missing tool", () => {
    expect(check(">=20", null)).toBe("missing");
  });

  it("reports unknown when no detector exists", () => {
    expect(check(">=1", "1.0.0", "cobol")).toBe("unknown");
  });

  it("reports unknown for an unparseable version", () => {
    expect(check(">=1", "banana")).toBe("unknown");
  });
});
