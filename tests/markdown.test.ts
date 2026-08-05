import { describe, expect, it } from "vitest";
import { renderMarkdown } from "../src/report/markdown.js";

describe("renderMarkdown", () => {
  it("renders a table row with fix and source", () => {
    const text = renderMarkdown([
      {
        id: "node",
        verdict: "guilty",
        subject: "Node.js 18",
        evidence: "Theirs: 22",
        fix: "Upgrade",
        source: "https://example.com",
      },
    ]);
    expect(text).toContain("| guilty | Node.js 18 |");
    expect(text).toContain("**Fix:** Upgrade");
    expect(text).toContain("[Source](https://example.com)");
  });

  it("escapes pipes and line breaks", () => {
    const text = renderMarkdown([
      { id: "x", verdict: "suspicious", subject: "a|b", evidence: "x\ny" },
    ]);
    expect(text).toContain("a\\|b");
    expect(text).toContain("x y");
  });

  it("omits the table for an empty case", () => {
    const text = renderMarkdown([]);
    expect(text).not.toContain("| Verdict");
    expect(text).toContain("Case dismissed");
  });
});
