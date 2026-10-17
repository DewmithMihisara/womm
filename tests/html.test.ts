import { describe, expect, it } from "vitest";
import { renderHtml } from "../src/report/html.js";

describe("renderHtml", () => {
  it("escapes hostile values", () => {
    const html = renderHtml([
      {
        id: "x",
        verdict: "suspicious",
        subject: "<script>alert(1)</script>",
        evidence: '"><img src=x onerror=alert(1)>',
        fix: "<b>x</b>",
      },
    ]);
    expect(html).not.toContain("<script>alert");
    expect(html).not.toContain("<img");
    expect(html).not.toContain("<b>x");
  });

  it("only links https sources", () => {
    const html = renderHtml([
      { id: "x", verdict: "guilty", subject: "s", evidence: "e", source: "javascript:alert(1)" },
    ]);
    expect(html).not.toContain("javascript:");
  });

  it("escapes quotes in links", () => {
    const html = renderHtml([
      { id: "x", verdict: "guilty", subject: "s", evidence: "e", source: 'https://a.com/"onclick="x' },
    ]);
    expect(html).not.toContain('"onclick="');
    expect(html).toContain("https://a.com/&quot;onclick");
  });

  it("handles an empty case", () => {
    expect(renderHtml([])).toContain("Case dismissed");
  });
});
