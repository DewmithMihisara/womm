import { describe, expect, it } from "vitest";
import { renderRulesDoc } from "../src/report/rulesdoc.js";

describe("renderRulesDoc", () => {
  it("lists rules with their sources and a count", () => {
    const text = renderRulesDoc([
      {
        id: "a-rule",
        title: "A | B",
        why: "W",
        fix: "F",
        source: "https://example.com",
        when: [{ finding: "x", missing: true }],
      },
    ]);
    expect(text).toContain("`a-rule`");
    expect(text).toContain("A \\| B");
    expect(text).toContain("[Source](https://example.com)");
    expect(text).toContain("There are 1 rules.");
  });
});
