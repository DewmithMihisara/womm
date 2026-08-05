import { describe, expect, it } from "vitest";
import { closingStatement, renderTrial, tally } from "../src/report/court.js";
import type { Charge } from "../src/trial.js";

const charge = (verdict: Charge["verdict"]): Charge => ({
  id: "node",
  verdict,
  subject: "Node.js 18",
  evidence: "Theirs: 22",
});

describe("closingStatement", () => {
  it.each([
    [[], "Case dismissed"],
    [[charge("guilty")], "guilty parties"],
    [[charge("suspicious")], "No conviction"],
    [[charge("acquitted")], "All acquitted"],
  ])("sums up %j", (charges, expected) => {
    expect(closingStatement(charges as Charge[])).toContain(expected);
  });

  it("never claims certainty", () => {
    const text = [[charge("guilty")], [charge("suspicious")], []]
      .map(closingStatement)
      .join(" ");
    expect(text).not.toMatch(/definitely|certainly|is the problem/i);
  });
});

describe("tally", () => {
  it("counts each verdict", () => {
    expect(tally([charge("guilty"), charge("guilty"), charge("acquitted")])).toBe(
      "2 guilty, 0 suspicious, 1 acquitted.",
    );
  });
});

describe("renderTrial", () => {
  it("includes evidence, fix and source", () => {
    const text = renderTrial([
      { ...charge("guilty"), fix: "Upgrade", source: "https://example.com" },
    ]);
    expect(text).toContain("GUILTY");
    expect(text).toContain("Theirs: 22");
    expect(text).toContain("Fix: Upgrade");
    expect(text).toContain("Source: https://example.com");
  });

  it("handles an empty case", () => {
    expect(renderTrial([])).toContain("Case dismissed");
  });
});
