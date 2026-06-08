import { describe, expect, it } from "vitest";
import { renderCertificate } from "../src/certificate/svg.js";
import type { CheckResult } from "../src/project/check.js";

const met: CheckResult = {
  tool: "node",
  range: ">=20",
  source: ".nvmrc",
  actual: "22.0.0",
  status: "met",
};

describe("renderCertificate", () => {
  it("includes the project, evidence and date", () => {
    const svg = renderCertificate("my-app", [met], "2026-11-06");
    expect(svg).toContain("my-app");
    expect(svg).toContain("node 22.0.0");
    expect(svg).toContain("2026-11-06");
  });

  it("escapes hostile text", () => {
    const svg = renderCertificate('<script>alert("x")</script>', [met], "today");
    expect(svg).not.toContain("<script>");
    expect(svg).toContain("&lt;script&gt;");
  });

  it("escapes ranges containing angle brackets", () => {
    const svg = renderCertificate("a", [{ ...met, range: "<23" }], "today");
    expect(svg).toContain("&lt;23");
  });

  it("lists only requirements that were met", () => {
    const svg = renderCertificate("a", [{ ...met, status: "unmet" }], "today");
    expect(svg).not.toContain("node 22.0.0");
  });
});
