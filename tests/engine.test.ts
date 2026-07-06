import { describe, expect, it } from "vitest";
import { ruleApplies } from "../src/rules/engine.js";
import type { Condition, Rule } from "../src/rules/types.js";

const rule = (...when: Condition[]): Rule => ({
  id: "r",
  title: "T",
  why: "W",
  fix: "F",
  source: "https://example.com",
  when,
});
const node = (value: string | null) => [{ id: "node", label: "Node", value }];

describe("ruleApplies", () => {
  it("matches a version range", () => {
    const r = rule({ finding: "node", range: ">=17" });
    expect(ruleApplies(r, node("22.0.0"))).toBe(true);
    expect(ruleApplies(r, node("16.0.0"))).toBe(false);
  });

  it("does not match a range when the tool is missing", () => {
    const r = rule({ finding: "node", range: ">=17" });
    expect(ruleApplies(r, node(null))).toBe(false);
    expect(ruleApplies(r, [])).toBe(false);
  });

  it("matches listed values", () => {
    const r = rule({ finding: "node", equals: ["a", "b"] });
    expect(ruleApplies(r, node("b"))).toBe(true);
    expect(ruleApplies(r, node("c"))).toBe(false);
  });

  it("matches a missing tool", () => {
    const r = rule({ finding: "node", missing: true });
    expect(ruleApplies(r, node(null))).toBe(true);
    expect(ruleApplies(r, [])).toBe(true);
    expect(ruleApplies(r, node("1.0.0"))).toBe(false);
  });

  it("requires a listed dependency", () => {
    const r = rule({ finding: "node", range: ">=17" }, { dependency: "webpack" });
    expect(ruleApplies(r, node("22.0.0"), { webpack: "^4.0.0" })).toBe(true);
    expect(ruleApplies(r, node("22.0.0"), {})).toBe(false);
  });

  it("is not fooled by names inherited from Object", () => {
    const r = rule({ finding: "node", range: ">=17" }, { dependency: "constructor" });
    expect(ruleApplies(r, node("22.0.0"), {})).toBe(false);
  });

  it("checks that dependency ranges overlap", () => {
    const r = rule(
      { finding: "node", range: ">=17" },
      { dependency: "webpack", range: "<5" },
    );
    expect(ruleApplies(r, node("22.0.0"), { webpack: "^4.0.0" })).toBe(true);
    expect(ruleApplies(r, node("22.0.0"), { webpack: "^5.0.0" })).toBe(false);
  });

  it("does not guess about non-registry dependency versions", () => {
    const r = rule(
      { finding: "node", range: ">=17" },
      { dependency: "webpack", range: "<5" },
    );
    expect(ruleApplies(r, node("22.0.0"), { webpack: "workspace:*" })).toBe(false);
  });

  it("requires every condition to hold", () => {
    const r = rule(
      { finding: "node", range: ">=17" },
      { finding: "os.platform", equals: ["win32"] },
    );
    expect(ruleApplies(r, node("22.0.0"))).toBe(false);
  });
});
