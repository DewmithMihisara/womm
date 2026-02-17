import { describe, expect, it } from "vitest";
import { renderDifferences, renderFindings } from "../src/report/text.js";

describe("renderFindings", () => {
  it("aligns labels and marks missing tools", () => {
    const text = renderFindings([
      { id: "a", label: "Git", value: "2.5" },
      { id: "b", label: "Node.js", value: null },
    ]);
    expect(text).toContain("Git      2.5");
    expect(text).toContain("not installed");
  });
});

describe("renderDifferences", () => {
  it("says so when nothing differs", () => {
    expect(renderDifferences([])).toBe("No differences found.");
  });

  it("shows both values", () => {
    const text = renderDifferences([
      { id: "n", label: "Node.js", a: "18.0.0", b: null, kind: "only-a" },
    ]);
    expect(text).toContain("18.0.0");
    expect(text).toContain("not installed");
  });
});
